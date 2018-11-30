<template>
    <main>
        <button v-if="systemActive === false" @click="runSystem">Run</button>
        <button v-if="systemActive === true" @click="systemActive = false">Stop</button>
        <button @click="newLoop">Add Part</button>
        <div class="partConfig" v-for="part in parts">
            <div class="metaConfig">
                <h1>{{part.id}}</h1>
                <div>
                    <label>Next Part:</label>
                    <button @click="addNextPart(part)">+</button>
                    <button @click="removeNextPart(part)">-</button>
                    <p>all probabilities must add to one</p>
                    <span class="nextPart" v-for="next in part.next">
                      {id: <input class="id" v-model.number="next.id">, probability: <input class="weight" v-model.number="next.weight"> }
                    </span>
                </div>
            </div>
            <div class="eventConfig">
                <div v-for="(event, index) in part.events" class="event" :class="{'eventPlaying': event.meta.active}">
                    <span class="eventConfigButtons">                    
                      <button @click="removeEvent(part, index)" :disabled="part.events.length === 1"  v-tooltip="'Remove this event'">x</button>
                    <button @click="addEvent(part, index)" v-tooltip="'Add new event to following slot'">+</button>
                    </span>
                    <div class="noteConfig">
                        <span class="noteLabel">
                          <label>Notes:</label>
                          <span class="noteConfigButtons">
                            <span @click="addNote(part, index)">+</span>
                        <span @click="removeNote(part, index)" :disabled="event.notes.length === 1">-</span>
                        </span>
                        </span>
                        <input v-for="(note, index) in event.notes" v-model="event.notes[index]"></input>
                    </div>
                    <div>
                        <label>Velocity:</label>
                        <input type="range" v-model="event.velocity" min="0" max="1" step="0.05">
                    </div>
                    <div>
                        <label>Time:</label>
                        <input v-model="event.time">
                    </div>
                    <div>
                        <label>Duration:</label>
                        <input v-model="event.duration">
                    </div>
                </div>
            </div>
        </div>
        <pre>{{this.parts}}</pre>
    </main>
</template>
<script>
export default {
    name: 'compose',
    props: ['synth', 'Tone'],
    data() {
        return {
            systemActive: false,
            parts: [],
            sleep: 0,
            partId: 3,
            eventBase: {
                notes: [
                    'A2'
                ],
                velocity: 0.5,
                time: '0:0:0',
                duration: '0:1:0',
                meta: {
                    active: false,
                    partId: '0'
                }
            }
        }
    },
    computed: {
        newPart() {
            var event = _.cloneDeep(this.eventBase)
            event.meta.partId = _.cloneDeep(this.partId)

            var part = {
                id: _.cloneDeep(this.partId),
                events: [event],
                next: [{
                    id: 0,
                    weight: 1
                }],
                duration: 0,
                sleep: '0:0:0'
            }

            return part
        }
    },
    methods: {
        newLoop() {
            this.parts.push(this.newPart)
            this.partId++
        },
        addNextPart(part) {
            part.next.push({
                id: 0,
                weight: 0
            })
        },
        removeNextPart(part) {
            part.next.pop()
        },
        addEvent(part, index) {
            let newEvent = _.cloneDeep(this.eventBase)
            newEvent.meta.partId = part.id
            part.events.splice(index + 1, 0, newEvent)
        },
        removeEvent(part, index) {
            part.events.splice(index, 1)
        },
        addNote(part, index) {
            part.events[index].notes.push('A2')
        },
        removeNote(part, index) {
            part.events[index].notes.pop()
        },
        pickWeightedRandom(next) {
            var weightedArray = []

            next.forEach(option => {
                var timesToAdd = option.weight * 100
                _.range(timesToAdd).forEach(() => weightedArray.push(option.id))
            })

            return _.sample(weightedArray)
        },
        runSystem() {
            this.systemActive = true
            this.cycleSystem()
        },
        cycleSystem() {

            if (this.systemActive) {
                // Config
                var continueLoop = true
                var playEvents = []

                var selectedLoop = this.parts[0]
                selectedLoop.events.forEach((event, index) => {
                    event.meta.index = index
                    playEvents.push(event)
                })

                var finalEvent = _.last(playEvents)
                var partEnd = this.Tone.TimeBase(finalEvent.time) + this.Tone.TimeBase(finalEvent.duration)

                var nextLoopId = this.pickWeightedRandom(selectedLoop.next)
                var nextLoop = this.parts[nextLoopId]

                if (nextLoop.id === 0) {
                    continueLoop = false
                }

                while (continueLoop) {


                    selectedLoop = _.cloneDeep(nextLoop)
                    selectedLoop.events.forEach((event, index) => {
                        event.time = this.Tone.TimeBase(partEnd) + this.Tone.TimeBase(event.time)
                        event.meta.index = index
                        playEvents.push(event)
                    })

                    finalEvent = _.last(playEvents)
                    partEnd = this.Tone.TimeBase(finalEvent.time) + this.Tone.TimeBase(finalEvent.duration)
                    nextLoopId = this.pickWeightedRandom(selectedLoop.next)
                    nextLoop = this.parts[nextLoopId]

                    if (nextLoop.id === 0) {
                        continueLoop = false
                    }


                }

                playEvents.forEach(event => {
                    this.Tone.Transport.schedule(time => {
                        let eventTime = time + this.Tone.Time(event.time).toSeconds()

                        this.synth.triggerAttackRelease(event.notes, event.duration, eventTime, event.velocity)

                        this.Tone.Draw.schedule(() => {
                            this.parts[event.meta.partId].events[event.meta.index].meta.active = true
                        }, eventTime)

                        this.Tone.Draw.schedule(() => {
                            this.parts[event.meta.partId].events[event.meta.index].meta.active = false
                        }, eventTime + this.Tone.Time(event.duration).toSeconds())


                    })
                })

                var loopLength = (this.Tone.Time(finalEvent.time).toSeconds() + this.Tone.Time(finalEvent.duration).toSeconds()) * 1000
                setTimeout(this.cycleSystem, loopLength)
            }

        }
    },
    mounted() {
        this.parts = [{
            "id": 0,
            "events": [{
                "notes": [
                    "F2",
                    "A2"
                ],
                "velocity": 0.5,
                "time": "0:0:0",
                "duration": "0:2:2",
                "meta": {
                    "active": false,
                    "partId": 0,
                    "index": 0
                }
            }, {
                "notes": [
                    "G2",
                    "Bb2"
                ],
                "velocity": 0.5,
                "time": "0:2:2",
                "duration": "0:2:2",
                "meta": {
                    "active": false,
                    "partId": 0,
                    "index": 1
                }
            }, {
                "notes": [
                    "A2",
                    "C3"
                ],
                "velocity": "0.3",
                "time": "0:4:4",
                "duration": "1:0:0",
                "meta": {
                    "active": false,
                    "partId": 0,
                    "index": 2
                }
            }],
            "next": [{
                "id": 0,
                "weight": 0.5
            }, {
                "id": 1,
                "weight": 0.5
            }],
            "duration": 0,
            "sleep": "0:0:0"
        }, {
            "id": 1,
            "events": [{
                "notes": [
                    "Bb2"
                ],
                "velocity": 0.5,
                "time": "0:0:0",
                "duration": "0:3:0",
                "meta": {
                    "active": false,
                    "partId": 1
                }
            }, {
                "notes": [
                    "A2"
                ],
                "velocity": 0.5,
                "time": "0:3:0",
                "duration": "0:2:0",
                "meta": {
                    "active": false,
                    "partId": 1
                }
            }, {
                "notes": [
                    "G2"
                ],
                "velocity": 0.5,
                "time": "1:1:0",
                "duration": "0:1:0",
                "meta": {
                    "active": false,
                    "partId": 1
                }
            }],
            "next": [{
                "id": 0,
                "weight": 0.75
            }, {
                "id": 2,
                "weight": 0.25
            }],
            "duration": 0,
            "sleep": "0:0:0"
        }, {
            "id": 2,
            "events": [{
                "notes": [
                    "F2",
                    "Bb2",
                    "D3"
                ],
                "velocity": "0.2",
                "time": "0:1:0",
                "duration": "1:2:0",
                "meta": {
                    "active": false,
                    "partId": 2
                }
            }],
            "next": [{
                "id": 0,
                "weight": 1
            }],
            "duration": 0,
            "sleep": "0:0:0"
        }]
    },
    beforeDestroy() {
        console.log('tear down compose component')
    }
}
</script>
<style lang="scss">
.nextPart {
    display: inline-block;
    .id {
        width: 10px;
    }
    .weight {
        width: 30px
    }
}

.partConfig {
    margin: 20px 0px;
    border: 1px solid #7E7E7E;
    display: flex;
}

.metaConfig {
    padding: 20px 10px;
    background-color: #fff4f8;
    flex-basis: 0;
    flex-grow: 1;
    text-align: center;
    h1 {
        font-weight: 100;
        font-size: 70px;
        margin: 10px 0px;
    }
    p {
        font-size: 9px;
        margin: 0px 0px 10px 0px;
        color: grey;
    }
    span {
        font-size: 10px
    }
    .sleepConfig {
        margin-top: 20px;
    }
}

.eventConfig {
    flex-basis: 0;
    flex-grow: 4;
    display: flex;
    flex-wrap: wrap;
    padding: 20px;
    .event {
        flex-grow: 1;
        position: relative;
        max-width: 220px;
        max-height: 100px;
        border: 1px solid #7E7E7E;
        padding: 10px;
        margin: 0px 10px 20px 0px;
        .eventConfigButtons {
            position: absolute;
            top: -11px;
            right: 5px;
            button {
                border: 1px solid #7E7E7E;
            }
        }
        .noteConfig {
            .noteLabel {
                display: inline-block;
                width: 70px;
                .noteConfigButtons {
                    position: relative;
                    top: 5px;
                    left: 5px;
                    span {
                        font-size: 15px;
                        font-weight: 900;
                        cursor: pointer;
                        margin-right: 5px;
                    }
                    span:hover {
                        color: blue
                    }
                }
            }
            input {
                height: 30px;
                width: 20px;
                text-align: center;
            }
        }
        label {
            display: inline-block;
            width: 70px;
        }
    }
}

.eventPlaying {
    background: #d7d7d7;
}

.tooltip {
    font-family: monospace;
    display: block !important;
    z-index: 10000;
    .tooltip-inner {
        background: #454545;
        color: white;
        padding: 5px 10px 4px;
    }
    .tooltip-arrow {
        width: 0;
        height: 0;
        border-style: solid;
        position: absolute;
        margin: 5px;
        border-color: black;
        z-index: 1;
    }
    &[x-placement^="top"] {
        margin-bottom: 5px;
        .tooltip-arrow {
            border-width: 5px 5px 0 5px;
            border-left-color: transparent !important;
            border-right-color: transparent !important;
            border-bottom-color: transparent !important;
            bottom: -5px;
            left: calc(50% - 5px);
            margin-top: 0;
            margin-bottom: 0;
        }
    }
    &[x-placement^="bottom"] {
        margin-top: 5px;
        .tooltip-arrow {
            border-width: 0 5px 5px 5px;
            border-left-color: transparent !important;
            border-right-color: transparent !important;
            border-top-color: transparent !important;
            top: -5px;
            left: calc(50% - 5px);
            margin-top: 0;
            margin-bottom: 0;
        }
    }
    &[x-placement^="right"] {
        margin-left: 5px;
        .tooltip-arrow {
            border-width: 5px 5px 5px 0;
            border-left-color: transparent !important;
            border-top-color: transparent !important;
            border-bottom-color: transparent !important;
            left: -5px;
            top: calc(50% - 5px);
            margin-left: 0;
            margin-right: 0;
        }
    }
    &[x-placement^="left"] {
        margin-right: 5px;
        .tooltip-arrow {
            border-width: 5px 0 5px 5px;
            border-top-color: transparent !important;
            border-right-color: transparent !important;
            border-bottom-color: transparent !important;
            right: -5px;
            top: calc(50% - 5px);
            margin-left: 0;
            margin-right: 0;
        }
    }
    &.popover {
        $color: #f9f9f9;
        .popover-inner {
            background: $color;
            color: black;
            padding: 24px;
            border-radius: 5px;
            box-shadow: 0 5px 30px rgba(black, .1);
        }
        .popover-arrow {
            border-color: $color;
        }
    }
    &[aria-hidden='true'] {
        visibility: hidden;
        opacity: 0;
        transition: opacity .15s, visibility .15s;
    }
    &[aria-hidden='false'] {
        visibility: visible;
        opacity: 1;
        transition: opacity .15s;
    }
}
</style>