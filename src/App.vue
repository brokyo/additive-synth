<template>
    <main id="container">
        <div id="controls">
            <h1>Synth + Loop Assembly</h1>
            <span class="introText">Play with letter keys. Works with MIDI keyboards, also. Click export to use in your own projects.</span>
            <a @click="activeState = 'configure'" :class="{'active': activeState === 'configure'}">Configure</a>
            <a @click="activeState = 'compose'" :class="{'active': activeState === 'compose'}">Compose</a>
            <a @click="activeState = 'export'" :class="{'active': activeState === 'export'}">Export</a>
        </div>
        <compose v-show="activeState === 'compose'" :synth="synth" :Tone="toneRef"></compose>
        <!-- <div id="recording" v-if="activeState === 'record'">
    <div id="recordTab">
        <div id="recordingTag">
            <span><span v-if="!recording">Not</span> Recording</span>
        </div>
        <div @click="startRecording" v-if="!recording" class="button">Start Recording</div>
        <div @click="stopRecording" v-if="recording" class="button">Stop Recording</div>
    </div>
    <div>
        <div v-for="(loop,index) in loops" class="loopContainer">
            <div>
                <button @click="startLoop(index)" :disabled="loop.active === 'true'">Start Loop</button>
                <button @click="stopLoop(index)" :disabled="loop.active === 'false'">Stop Loop</button>
            </div>
            <div>
                <label>Events</label>
                <button @click="addEvent(index)">+</button>
                <button @click="removeEvent(index)">-</button>
                <label>Add key to all events</label>
                <input v-model="newKey">
                <button @click="addKey(loop)">Add</button>
                <label>Loop Sleep</label>
                <input v-model="loop.eventsConfig.sleep">
            </div>
            <div class="loopBuilder">
                <div class="event" :class="{'eventPlaying': event.active}" v-for="(event, eventIndex) in loop.eventsConfig.events">
                    <div v-for="(value, key) in event">
                        <div class="label">
                            <label>{{key}}:</label>
                            <span v-if="key === 'note'">
                                      <button @click="addNote(loop, eventIndex)">+</button>
                                      <button :disabled="value.length === 1" @click="removeNote(loop, eventIndex)">-</button>
                                    </span>
                        </div>
                        <div class="inputs">
                            <span v-if="key === 'note'">
                                      <input class="noteInput" v-for="(note, noteIndex) in value" v-model="value[noteIndex]">
                                    </span>
                            <span v-else>
                                      <input v-model="event[key]">
                                    </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="eventsConfig">
                <pre>{{loop.eventsConfig}}</pre>
            </div>
            <a @click="clearLoop(index)">Clear Loop</a>
        </div>
    </div>
</div> -->
        <div id="fullConfig" v-if="activeState === 'configure'">
            <div id="savedPatches" class="patchConfig">
                <label>Saved Patch</label>
                <select v-model="basePatch" @change="applyPatch">
                    <option v-for="(patch, index) in patches" :value="index">{{patch.name}}</option>
                </select>
            </div>
            <div id="oscType" class="patchConfig">
                <div v-if="mode === 'partials'" id="partialConfig">
                    <div class="title">
                        <label>partials</label>
                        <div id="buttons">
                            <button @click="decreasePartials" :disabled="partialCount === 1">-</button>
                            <button @click="increasePartials">+</button>
                        </div>
                    </div>
                    <div class="config">
                        <input type="range" min="0" max="1" step="0.005" v-model.number="partials[index]" v-for="(partial, index) in partials"></input>
                    </div>
                    <div class="code">
                        <pre>{{partials}}</pre>
                    </div>
                </div>
                <div v-if="mode === 'type'">
                    <label>Oscillator</label>
                    <select v-model="oscillator">
                        <option v-for="oscillator in oscillatorArray">{{oscillator}}</option>
                    </select>
                    <input id="customPartials" type="range" min="1" max="16" v-model="oscillatorPartials"></input>{{oscillatorPartials}}
                </div>
            </div>
            <div id="envelope" class="patchConfig">
                <div class="title">
                    <label>envelope</label>
                </div>
                <div class="config">
                    <label>Attack</label>
                    <input type="range" v-model.number="envelopeConfig.attack" min="0" max="10" step="0.05"></input>
                    <label>Attack Curve</label>
                    <select v-model="envelopeConfig.attackCurve">
                        <option v-for="curve in curves">{{curve}}</option>
                    </select>
                    <label>Decay</label>
                    <input type="range" v-model.number="envelopeConfig.decay" min="0" max="5" step="0.1"></input>
                    <label>Sustain</label>
                    <input type="range" v-model.number="envelopeConfig.sustain" min="0" max="1" step="0.1"></input>
                    <label>Release</label>
                    <input type="range" v-model.number="envelopeConfig.release" min="0" max="10" step="0.05"></input>
                    <label>Release Curve</label>
                    <select v-model="envelopeConfig.releaseCurve">
                        <option v-for="curve in curves">{{curve}}</option>
                    </select>
                </div>
                <div class="code">
                    <pre>{{envelopeConfig}}</pre>
                </div>
            </div>
            <div id="tremolo" class="patchConfig">
                <div class="title">
                    <label>tremolo</label>
                </div>
                <div class="config">
                    <label>Audibility</label>
                    <input type="range" v-model.number="tremoloConfig.wet" min="0" max="1" step="0.05"></input>
                    <label>Frequency</label>
                    <input type="range" v-model.number="tremoloConfig.frequency" min="0.1" max="10" step="0.25"></input>
                    <label>Depth</label>
                    <input type="range" v-model.number="tremoloConfig.depth" min="0" max="1" step="0.05"></input>
                    <label>Oscillator</label>
                    <select v-model="tremoloConfig.type">
                        <option v-for="oscillator in oscillatorArray">{{oscillator}}</option>
                    </select>
                    <label>Spread</label>
                    <input type="range" v-model.number="tremoloConfig.spread" min="0" max="180" step="1"></input>
                </div>
                <div class="code">
                    <pre>{{tremoloConfig}}</pre>
                </div>
            </div>
            <div id="vibrato" class="patchConfig">
                <div class="title">
                    <label>vibrato</label>
                </div>
                <div class="config">
                    <label>Audibility</label>
                    <input type="range" v-model.number="vibratoConfig.wet" min="0" max="1" step="0.05"></input>
                    <label>Frequency</label>
                    <input type="range" v-model.number="vibratoConfig.frequency" min="0.1" max="10" step="0.25"></input>
                    <label>Depth</label>
                    <input type="range" v-model.number="vibratoConfig.depth" min="0" max="1" step="0.05"></input>
                    <label>Oscillator</label>
                    <select v-model="vibratoConfig.type">
                        <option v-for="oscillator in oscillatorArray">{{oscillator}}</option>
                    </select>
                    <label>Max Delay</label>
                    <input type="range" v-model.number="vibratoConfig.maxDelay" min="0" max="1" step="0.005"></input>
                </div>
                <div class="code">
                    <pre>{{vibratoConfig}}</pre>
                </div>
            </div>
            <div id="phaser" class="patchConfig">
                <div class="title">
                    <label>phaser</label>
                </div>
                <div class="config">
                    <label>Audibility</label>
                    <input type="range" v-model.number="phaserConfig.wet" min="0" max="1" step="0.05"></input>
                    <label>Base Frequency</label>
                    <input type="range" v-model.number="phaserConfig.baseFrequency" min="0" max="20000" step="1"></input>
                    <label>Frequency</label>
                    <input type="range" v-model.number="phaserConfig.frequency" min="0.1" max="10" step="0.1"></input>
                    <label>Octaves</label>
                    <input type="range" v-model.number="phaserConfig.octaves" min="0" max="8" step="1"></input>
                    <label>Stages</label>
                    <input type="range" v-model.number="phaserConfig.stages" min="0" max="8" step="1"></input>
                    <label>Q</label>
                    <input type="range" v-model.number="phaserConfig.Q" min="0" max="20" step="1"></input>
                </div>
                <div class="code">
                    <pre>{{phaserConfig}}</pre>
                </div>
            </div>
            <div id="feedbackDelay" class="patchConfig">
                <div class="title">
                    <label>feedback delay</label>
                </div>
                <div class="config">
                    <label>Audibility</label>
                    <input type="range" v-model.number="feedbackDelayConfig.wet" min="0" max="1" step="0.05"></input>
                    <label>Delay Time</label>
                    <input type="range" v-model.number="feedbackDelayConfig.delayTime" min="0" max="1" step="0.005"></input>
                    <label>Feedback</label>
                    <input type="range" v-model.number="feedbackDelayConfig.feedback" min="0" max="1" step="0.05"></input>
                </div>
                <div class="code">
                    <pre>{{feedbackDelayConfig}}</pre>
                </div>
            </div>
            <div id="chorus" class="patchConfig">
                <div class="title">
                    <label>chorus</label>
                </div>
                <div class="config">
                    <label>Audibility</label>
                    <input type="range" v-model.number="chorusConfig.wet" min="0" max="1" step="0.05"></input>
                    <label>Frequency</label>
                    <input type="range" v-model.number="chorusConfig.frequency" min="0.1" max="10" step="0.25"></input>
                    <label>Delay Time</label>
                    <input type="range" v-model.number="chorusConfig.delayTime" min="0" max="5" step="0.1"></input>
                    <label>Depth</label>
                    <input type="range" v-model.number="chorusConfig.depth" min="0" max="1" step="0.05"></input>
                    <label>Feedback</label>
                    <input type="range" v-model.number="chorusConfig.feedback" min="0" max="1" step="0.05"></input>
                    <label>Oscillator</label>
                    <select v-model="chorusConfig.type">
                        <option v-for="oscillator in oscillatorArray">{{oscillator}}</option>
                    </select>
                    <label>Spread</label>
                    <input type="range" v-model.number="chorusConfig.spread" min="0" max="180" step="1"></input>
                </div>
                <div class="code">
                    <pre>{{chorusConfig}}</pre>
                </div>
            </div>
            <div id="eq3" class="patchConfig">
                <div class="title">
                    <label>EQ</label>
                </div>
                <div class="config">
                    <label>Low</label>
                    <input type="range" max="0" min="-30" v-model="EQ3Config.low"></input>
                    <label>Medium</label>
                    <input type="range" max="0" min="-30" v-model="EQ3Config.mid"></input>
                    <label>High</label>
                    <input type="range" max="0" min="-30" v-model="EQ3Config.high"></input>
                </div>
                <div class="code">
                    <pre>{{EQ3Config}}</pre>
                </div>
            </div>
            <div id="reverb" class="patchConfig">
                <div class="title">
                    <label>Reverb</label>
                </div>
                <div class="config">
                    <label>Room Size</label>
                    <input type="range" min="0" max="1" step="0.05" v-model="reverbConfig.roomSize"></input>
                    <label>Dampening</label>
                    <input type="range" min="0" max="2000" v-model="reverbConfig.dampening"></input>
                </div>
                <div class="code">
                    <pre>{{reverbConfig}}</pre>
                </div>
            </div>
            <div id="filter" class="patchConfig">
                <div class="title">
                    <label>filter</label>
                    <button @click="toggleFilter" id="filterButton">Toggle Filter</button>
                </div>
                <div class="config">
                    <div v-if="filterConfig.active">
                        <label>Frequency</label>
                        <input type="range" v-model.number="filterConfig.frequency" min="0" max="2000"></input>
                        <label>Filter Type</label>
                        <select v-model="filterConfig.type">
                            <option v-for="filterType in filterArray">{{filterType}}</option>
                        </select>
                        <label>Filter Rolloff</label>
                        <select v-model.number="filterConfig.rolloff">
                            <option v-for="rolloff in rolloffArray">
                                <select>{{rolloff}}</select>
                            </option>
                        </select>
                        <label>Q</label>
                        <input type="range" v-model.numer="filterConfig.Q" min="0" max="50"></input>
                    </div>
                </div>
                <div class="code">
                    <pre>{{filterConfig}}</pre>
                </div>
            </div>
            <div id="meta" class="patchConfig">
                <label>Patch Name</label>
                <input v-model="patchName"></input>
            </div>
            <div class="button" @click="savePatch">Save Patch</div>
        </div>
        <div id="exportCode" v-if="activeState === 'export'">
            <label class="exportLabel">Synth Name</label>
            <input v-model="importName">
            <p class="introText">The file below contains all the metadata for your synth. Import it to your app as described in app.js then call assembleSynth(). This method returns a promise which allow you to connect {{importName}}.patch.out node to Tone.Master in your app. After that it functions normally (i.e. you can call {{importName}}.patch.synth.triggerAttackRelease(), change node values, etc)</p>
            <p class="introText">Note: bus, loop, and start patterns are for creating probabilistic loops connected to a visualizer (see: <a href="/olp2">Everything A Cycle</a>)</p>
            <h3>app.js</h3>
            <p>import {{importName}} from '../store/synths/{{importName}}.js'</p>
            <h3>{{importName}}.js</h3>
            <p>export default {</p>
            <p v-if="exportName">name: '{{exportName}}',</p>
            <p v-else>name: '{{importName}}',</p>
            <p>bus: {},</p>
            <p>config: { synth: {oscillator: {partials: {{partials}}}, envelope: {{envelopeConfig}}}, tremolo: {{tremoloConfig}}, vibrato: {{vibratoConfig}}, phaser: {{phaserConfig}}, feedbackDelay: {{feedbackDelayConfig}}, chorus: {{chorusConfig}}, EQ3: {{EQ3Config}}, reverb: {{reverbConfig}}, filter: {{filterConfig}}},</p>
            <p>patch: { synth: {}, tremolo: {}, vibrato: {}, phaser: {}, feedbackDelay: {}, chorus: {}, EQ3: {}, reverb: {}, filter: {}, autoPanner: {}, out: {}},</p>
            <p>loop: {},</p>
            <p>// Pass AssembleSynth() a reference to ToneJS so it can do Tone stuff.</p>
            <p>assembleSynth: function(Tone){ this.patch.synth = new Tone.PolySynth(10, Tone.Synth); this.patch.synth.set(this.config.synth); this.patch.tremolo = new Tone.Tremolo(this.config.tremolo); this.patch.vibrato = new Tone.Vibrato(this.config.vibrato); this.patch.phaser = new Tone.Phaser(this.config.phaser); this.patch.feedbackDelay = new Tone.FeedbackDelay(this.config.feedbackDelay); this.patch.chorus = new Tone.Chorus(this.config.chorus); this.patch.EQ3 = new Tone.EQ3(this.config.EQ3); this.patch.reverb = new Tone.Freeverb(this.config.reverb); if(this.patch.filter.active){ this.patch.filter = new Tone.Filter(this.config.filter)} else { this.patch.filter = new Tone.Gain()}; this.patch.out = new Tone.Gain(); this.patch.synth.chain(this.patch.tremolo, this.patch.vibrato, this.patch.phaser, this.patch.feedbackDelay, this.patch.chorus, this.patch.EQ3, this.patch.reverb, this.patch.filter, this.patch.out); return new Promise((resolve, reject) => { resolve(true);})},</p>
            <p>start: function(){}</p>
            <p>}</p>
        </div>
        <logo id="logo"></logo>
    </main>
</template>
<script>
import {
    db
} from './plugins/firebase.js'
import compose from './components/compose.vue'
import logo from './components/logo.vue'
var Tone = require('tone')
var _ = require('lodash')

export default {
    components: {
        compose,
        logo
    },
    data() {
        return {
            // Admin
            activeState: 'configure',
            basePatch: '',
            exportName: '',

            // ToneJS
            synth: {},
            tremolo: {},
            vibrato: {},
            phaser: {},
            feedbackDelay: {},
            chorus: {},
            EQ3: {},
            reverb: {},
            filter: {},

            // Tone Config
            envelopeConfig: {
                attack: 0.05,
                attackCurve: 'linear',
                decay: 0.1,
                sustain: 0.3,
                release: 2,
                releaseCurve: 'linear'
            },
            tremoloConfig: {
                frequency: 10,
                type: 'sine',
                depth: 0.5,
                spread: 180,
                wet: 0,
            },
            vibratoConfig: {
                maxDelay: 0.005,
                frequency: 5,
                depth: 0.1,
                type: 'sine',
                wet: 0
            },
            phaserConfig: {
                baseFrequency: 350,
                frequency: 0.5,
                octaves: 3,
                stages: 10,
                Q: 10,
                wet: 0
            },
            feedbackDelayConfig: {
                delayTime: 0.25,
                feedback: 0.5,
                wet: 0
            },
            chorusConfig: {
                frequency: 1.5,
                delayTime: 3.5,
                depth: 0.7,
                feedback: 0.1,
                type: 'sine',
                spread: 180,
                wet: 0
            },
            EQ3Config: {
                low: 0,
                mid: 0,
                high: 0
            },
            reverbConfig: {
                roomSize: 0.7,
                dampening: 3000,
            },
            filterConfig: {
                active: true,
                type: 'lowpass',
                frequency: 2000,
                rolloff: -12,
                Q: 0
            },

            // Config - Model
            triggers: [{
                note: 'F5',
                keyCode: 'q'
            }, {
                note: 'G5',
                keyCode: 'w'
            }, {
                note: 'A5',
                keyCode: 'e'
            }, {
                note: 'Bb5',
                keyCode: 'r'
            }, {
                note: 'C6',
                keyCode: 't'
            }, {
                note: 'D6',
                keyCode: 'y'
            }, {
                note: 'E6',
                keyCode: 'u'
            }, {
                note: 'F6',
                keyCode: 'i'
            }, {
                note: 'F4',
                keyCode: 'a'
            }, {
                note: 'G4',
                keyCode: 's'
            }, {
                note: 'A4',
                keyCode: 'd'
            }, {
                note: 'Bb4',
                keyCode: 'f'
            }, {
                note: 'C5',
                keyCode: 'g'
            }, {
                note: 'D5',
                keyCode: 'h'
            }, {
                note: 'E5',
                keyCode: 'j'
            }, {
                note: 'F5',
                keyCode: 'k'
            }, {
                note: 'F2',
                keyCode: 'z'
            }, {
                note: 'G2',
                keyCode: 'x'
            }, {
                note: 'A2',
                keyCode: 'c'
            }, {
                note: 'Bb2',
                keyCode: 'v'
            }, {
                note: 'C3',
                keyCode: 'b'
            }, {
                note: 'D3',
                keyCode: 'n'
            }, {
                note: 'E3',
                keyCode: 'm'
            }, {
                note: 'F3',
                keyCode: ','
            }],
            mode: 'partials',
            partialCount: 3,
            partials: [1, 0.565, 0.27, 0.13],
            oscillator: 'sine',
            oscillatorPartials: 3,
            patchName: '',

            // Config Utility
            curves: ['linear', 'exponential', 'sine', 'cosine', 'bounce', 'ripple', 'step'],
            oscillatorArray: ['sine', 'square', 'sawtooth', 'triangle'],
            filterArray: ['bandpass', 'lowpass', 'highpass'],
            rolloffArray: [-12, -24, -48],

            // Record - Model
            recording: false,
            newLoop: {
                time: 0,
                end: 0,
                events: []
            },
            loops: [],
            newKey: '',

            // Export
            parentPatchObject: '',
            importName: 'synth'
        }
    },
    firebase: {
        patches: {
            source: db.ref('patches'),
            readyCallback: function() {
                let newPatch = this.patches[4]
                this.partials = newPatch.partials
                this.envelopeConfig = newPatch.envelopeConfig
                this.tremoloConfig = newPatch.tremoloConfig
                this.vibratoConfig = newPatch.vibratoConfig
                this.phaserConfig = newPatch.phaserConfig
                this.feedbackDelayConfig = newPatch.feedbackDelayConfig
                this.chorusConfig = newPatch.chorusConfig
                this.EQ3Config = newPatch.EQ3Config
                this.reverbConfig = newPatch.reverbConfig
                this.filterConfig = newPatch.filterConfig
            }
        }
    },
    mounted() {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess({
                sysex: false
            }).then(midiAccess => {
                var midi = midiAccess
                var inputs = midi.inputs.values();

                for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
                    input.value.onmidimessage = this.onMIDIMessage;
                }
            })
        }

        this.synth = new Tone.PolySynth({
            envelope: this.envelopeConfig
        })
        this.tremolo = new Tone.Tremolo(this.tremoloConfig)
        this.vibrato = new Tone.Vibrato(this.vibratoConfig)
        this.phaser = new Tone.Phaser(this.phaserConfig)
        this.feedbackDelay = new Tone.FeedbackDelay(this.feedbackDelay)
        this.chorus = new Tone.Chorus(this.chorusConfig)
        this.EQ3 = new Tone.EQ3(this.EQ3Config)
        this.reverb = new Tone.Freeverb(this.reverbConfig)
        this.filter = new Tone.Filter(this.filterConfig)

        this.synth.set({
            volume: -6
        })

        this.loops = [{
            "eventsConfig": {
                "loopLength": "16n + 32n",
                "events": [{
                    "note": [
                        "F2",
                        "A2"
                    ],
                    "velocity": "0.5",
                    "time": "0:0:0",
                    "duration": "1:2:0",
                    "active": false
                }, {
                    "note": [
                        "C3"
                    ],
                    "velocity": 0.8,
                    "time": "0:1:0",
                    "duration": "0:2:0",
                    "active": false
                }, {
                    "note": [
                        "Bb3",
                        "D4"
                    ],
                    "velocity": "0.2",
                    "time": "1:0:0",
                    "duration": "0:2:0",
                    "active": false
                }, {
                    "note": [
                        "G3"
                    ],
                    "velocity": 0.8,
                    "time": "1:1:0",
                    "duration": "0:1:0",
                    "active": false
                }, {
                    "note": [
                        "G2",
                        "Bb2"
                    ],
                    "velocity": "0.4",
                    "time": "1:2:0",
                    "duration": "3:0:0",
                    "active": false
                }, {
                    "note": [
                        "D3"
                    ],
                    "velocity": 0.8,
                    "time": "1:3:0",
                    "duration": "0:2:0",
                    "active": false
                }, {
                    "note": [
                        "C3",
                        "E4"
                    ],
                    "velocity": "0.4",
                    "time": "2:2:0",
                    "duration": "0:2:0",
                    "active": false
                }, {
                    "note": [
                        "D3",
                        "F4"
                    ],
                    "velocity": "0.3",
                    "time": "3:0:0",
                    "duration": "0:2:0",
                    "active": false
                }, {
                    "note": [
                        "C3",
                        "E4"
                    ],
                    "velocity": "0.3",
                    "time": "3:2:0",
                    "duration": "0:2:0",
                    "active": false
                }, {
                    "note": [
                        "A2",
                        "C4"
                    ],
                    "velocity": "0.2",
                    "time": "4:0:0",
                    "duration": "0:2:0",
                    "active": false
                }, {
                    "note": [
                        "Bb2",
                        "D3"
                    ],
                    "velocity": "0.2",
                    "time": "4:2:0",
                    "duration": "1:2:0",
                    "active": false
                }, {
                    "note": [
                        "A3"
                    ],
                    "velocity": "0.2",
                    "time": "4:2:0",
                    "duration": "0:2:0",
                    "active": false
                }, {
                    "note": [
                        "F3",
                        "F2"
                    ],
                    "velocity": "0.2",
                    "time": "5:0:0",
                    "duration": "1:0:0",
                    "active": false
                }],
                "sleep": "0"
            }
        }]

        this.synth.chain(this.tremolo, this.vibrato, this.phaser, this.feedbackDelay, this.chorus, this.EQ3, this.reverb, this.filter, Tone.Master)

        this.triggers.forEach((trigger) => {
            window.addEventListener('keydown', (e) => {
                if (e.key === trigger.keyCode & !e.repeat) {
                    let midiNote = Tone.Frequency(trigger.note).toMidi()
                    this.attack(trigger.note)

                }
            })

            window.addEventListener('keyup', (e) => {
                if (e.key === trigger.keyCode & !e.repeat) {
                    let midiNote = Tone.Frequency(trigger.note).toMidi()
                    this.release(trigger.note)
                }
            })
        })

        Tone.Transport.start();
    },
    computed: {
        constructedOscillator() {
            return this.oscillator + this.oscillatorPartials
        },
        loopToCopy(loop) {
            return JSON.Stringify(loop)
        },
        toneRef() {
            return Tone
        }
    },
    watch: {
        oscillator() {
            this.synth.set({
                oscillator: {
                    type: this.constructedOscillator
                }
            })
        },
        oscillatorPartials() {
            this.synth.set({
                oscillator: {
                    type: this.constructedOscillator
                }
            })
        },
        partials: _.debounce(function() {
            // Is this necessary?
            let setArray = []
            this.partials.forEach((partial) => {
                setArray.push(partial)
            })

            if (setArray.length > 0) {
                this.synth.set({
                    oscillator: {
                        partials: setArray
                    }
                })
            } else {
                this.synth.set({
                    oscillator: {
                        type: this.oscillator
                    }
                })
            }

        }, 500),
        envelopeConfig: {
            handler: function() {
                this.synth.set({
                    envelope: this.envelopeConfig
                })
            },
            deep: true
        },
        tremoloConfig: {
            handler: function() {
                this.tremolo.set(this.tremoloConfig)
            },
            deep: true
        },
        vibratoConfig: {
            handler: function() {
                this.vibrato.set(this.vibratoConfig)
            },
            deep: true
        },
        phaserConfig: {
            handler: function() {
                this.phaser.set(this.phaserConfig)
            },
            deep: true
        },
        feedbackDelayConfig: {
            handler: function() {
                this.feedbackDelay.set(this.feedbackDelayConfig)
            },
            deep: true
        },
        chorusConfig: {
            handler: function() {
                this.chorus.set(this.chorusConfig)
            },
            deep: true
        },
        EQ3Config: {
            handler: function() {
                this.EQ3.set(this.EQ3Config)
            },
            deep: true
        },
        reverbConfig: {
            handler: function() {
                this.reverb.set(this.reverbConfig)
            },
            deep: true
        },
        filterConfig: {
            handler: function() {
                this.filter.set(this.filterConfig)
            },
            deep: true
        },
    },
    methods: {
        onMIDIMessage(event) {
            let eventType = event.data[0] & 0xf0
            let note = Tone.Frequency(event.data[1], "midi").toNote()
            let velocity = event.data[2]
            switch (eventType) {
                case 144:
                    if (event.data[2] != 0) {
                        this.attack(note, velocity)
                        return;
                    }
                case 128:
                    this.release(note)
                    return;
            }
        },
        attack(note, midiVelocity = 40) {
            let toneVelocity

            if (midiVelocity <= 60) {
                toneVelocity = midiVelocity / 50
            } else if (midiVelocity > 60) {
                toneVelocity = midiVelocity / 100
            }

            this.synth.triggerAttack(note, undefined, toneVelocity)

            // if (this.recording) {
                let timeSeconds = Date.now() / 1000

                let event = {
                    note: [note],
                    velocity: toneVelocity,
                    // frequency: Tone.Frequency(note).toFrequency(),
                    // midi: Tone.Frequency(note).toMidi(),
                    timeSeconds: timeSeconds,
                    time: Tone.Time(timeSeconds - this.newLoop.start).toNotation(),
                    active: true
                }

                console.log(event.note)

                // this.newLoop.events.push(event)
            // }
        },
        release(note) {
            this.synth.triggerRelease(note)

            if (this.recording) {
                let endTime = Date.now() / 1000
                let event = _.find(this.newLoop.events, {
                    note: [note],
                    active: true
                })
                event.duration = Tone.Time(endTime - event.timeSeconds).toNotation()
                event.active = false
                console.log(event)

                // delete event.timeSeconds
            }
        },
        increasePartials() {
            this.partialCount++
                this.partials.push(0)
        },
        decreasePartials() {
            this.partialCount--
                this.partials.pop()
        },
        toggleFilter() {
            this.filterConfig.active = !this.filterConfig.active
            switch (this.filterConfig.active) {
                case true:
                    this.EQ3.disconnect(Tone.Master)
                    this.EQ3.connect(this.filter)
                    break
                case false:
                    this.EQ3.disconnect(this.filter)
                    this.EQ3.connect(Tone.Master)
                    break
            }
        },
        applyPatch() {
            let newPatch = this.patches[event.target.value]
            this.exportName = newPatch.name
            this.partials = newPatch.partials
            this.envelopeConfig = newPatch.envelopeConfig
            this.tremoloConfig = newPatch.tremoloConfig
            this.vibratoConfig = newPatch.vibratoConfig
            this.phaserConfig = newPatch.phaserConfig
            this.feedbackDelayConfig = newPatch.feedbackDelayConfig
            this.chorusConfig = newPatch.chorusConfig
            this.EQ3Config = newPatch.EQ3Config
            this.reverbConfig = newPatch.reverbConfig
            this.filterConfig = newPatch.filterConfig
        },
        savePatch() {
            let savedPatch = {
                name: this.patchName,
                partials: this.partials,
                envelopeConfig: this.envelopeConfig,
                tremoloConfig: this.tremoloConfig,
                vibratoConfig: this.vibratoConfig,
                phaserConfig: this.phaserConfig,
                feedbackDelayConfig: this.feedbackDelayConfig,
                chorusConfig: this.chorusConfig,
                EQ3Config: this.EQ3Config,
                reverbConfig: this.reverbConfig,
                filterConfig: this.filterConfig
            }

            this.$firebaseRefs.patches.push(savedPatch)
            this.patchName = ''
        },
        startRecording() {
            this.recording = true
            this.newLoop.start = Date.now() / 1000
        },
        stopRecording() {
            this.recording = false
            this.newLoop.end = Date.now() / 1000

            let loopLength = Tone.Time(this.newLoop.end - this.newLoop.start).toNotation()

            var loop = {
                eventsConfig: {
                    loopLength: loopLength,
                    events: this.newLoop.events,
                    sleep: 0
                }
            }

            this.loops.push(loop)

            this.newLoop = {
                start: 0,
                end: 0,
                events: []
            }
        },
        addKey(loop) {
            let newKey = this.newKey
            loop.eventsConfig.events.forEach(event => {
                event[newKey] = ''
            })
            this.newKey = ''
        },
        addNote(loop, index) {
            loop.eventsConfig.events[index].note.push('')
        },
        removeNote(loop, index) {
            loop.eventsConfig.events[index].note.pop()
        },
        startLoop(index) {
            this.loops[index].active = true
            this.runLoop(index)
        },
        stopLoop(index) {
            this.loops[index].active = false
        },
        addEvent(index) {
            let newEvent = {
                note: ['A4'],
                velocity: 0.8,
                time: 0,
                duration: 0,
                active: false
            }
            this.loops[index].eventsConfig.events.push(newEvent)
        },
        removeEvent(index) {
            this.loops[index].eventsConfig.events.pop()
        },
        runLoop(index) {
            var thisLoop = this.loops[index]

            if (thisLoop.active) {
                let playEvents = this.loops[index].eventsConfig.events

                playEvents.forEach((event, index) => {
                    Tone.Transport.schedule(time => {
                        let eventTime = time + Tone.Time(event.time).toSeconds()

                        this.synth.triggerAttackRelease(event.note, event.duration, eventTime, event.velocity)

                        Tone.Draw.schedule(() => {
                            event.active = true
                        }, time + Tone.Time(event.time).toSeconds())

                        Tone.Draw.schedule(() => {
                            event.active = false
                        }, time + Tone.Time(event.time).toSeconds() + Tone.Time(event.duration).toSeconds())
                    })
                })

                var lastEvent = _.last(playEvents)
                var loopLength = (Tone.Time(lastEvent.time).toSeconds() + Tone.Time(lastEvent.duration).toSeconds() + Tone.Time(thisLoop.eventsConfig.sleep).toSeconds()) * 1000

                setTimeout(this.runLoop, loopLength, index)
            }

        },
        clearLoop(index) {
            window.confirm('clear loop?')
            this.loops.splice(index, 1)
        }
    }
}
</script>
<style lang="scss" scoped="">
#container {
    width: 80%;
    margin: 0 auto;
    font-family: monospace;
    color: #454545;
}

main {
    .button {
        border: 1px solid #7E7E7E;
        text-align: center;
        margin: 0px auto 20px auto;
        width: 1000px;
        font-size: 16px;
        padding: 10px 0px;
    }
    .button:hover {
        background-color: #CDE2F6;
    }
    .button:active {
        background-color: #A9CFF3;
    }
}

.eventPlaying {
    background-color: pink;
}

#controls {
    display: block;
    margin: 0px auto 40px auto;
    h1 {
        margin-bottom: 0px;
    }
    .introText {
        display: block;
        font-size: 10px;
        margin-bottom: 20px;
    }
    a {
        margin-right: 10px
    }
    a:hover {
        color: #CDE2F6
    }
    .active {
        border-bottom: 4px solid #CDE2F6;
    }
}

#recording {
    #recordTab {
        width: 1000px;
        #recordingTag {
            padding: 4px 4px;
            background-color: #D7D7D7;
            color: #484848;
            font-weight: 900;
            width: 994px;
        }
        #code {
            background-color: #D7D7D7;
            color: #484848;
            font-size: 11px;
            text-align: left;
            font-weight: 500;
        }
    }
}

.loopContainer {
    position: relative;
    padding-bottom: 20px;
    border-bottom: 1px solid #7E7E7E;
    margin-bottom: 30px;
    .loopBuilder {
        margin: 20px 0px;
        display: flex;
        flex-wrap: wrap;
        .event {
            flex-grow: 1;
            max-width: 250px;
            margin-bottom: 20px;
            .label {
                font-weight: 900;
                display: inline-block;
                width: 100px;
            }
            .inputs {
                display: inline-block;
            }
            .noteInput {
                width: 23px;
                margin-right: 5px;
            }
        }
    }
    .input {
        label {
            font-weight: 900;
            margin-right: 0px;
        }
        input {
            margin-right: 20px;
        }
    }
    .eventsConfig {
        height: 200px;
        overflow: scroll;
    }
    pre {
        font-weight: 500;
    }
    p {
        font-size: 10px;
        font-weight: 100;
    }
    a {
        position: absolute;
        bottom: 0px;
        right: 0px;
    }
    a:hover {
        color: #CDE2F6
    }
}

#fullConfig {
    display: flex;
    flex-wrap: wrap;
    #savedPatches {
        border: 0px;
        select {
            margin-left: 20px;
            width: 80%;
        }
    }
    #meta {
        border: 0px;
        input {
            width: 80%;
            margin-left: 20px;
        }
    }
}

#exportCode {
    margin: 0px auto 20px auto;
    label {
        font-weight: 900
    }
    p {
        font-size: 11px;
        margin: 0
    }
    .introText {
        font-size: 12px;
        margin: 10px 0px
    }
}

.patchConfig {
    width: 100%;
    margin-bottom: 20px;
    display: flex;
    border: 1px solid #7E7E7E;
    #partialConfig {
        display: flex;
        width: 100%;
    }
    .title {
        display: flex;
        position: relative;
        flex-grow: 1;
        background-color: #fff4f8;
        flex-basis: 0;
        justify-content: center;
        label {
            font-family: sans-serif;
            justify-content: center;
            margin-top: 10px;
            text-align: center;
            font-weight: 500;
        }
        #buttons {
            position: absolute;
            top: 40px;
        }
        #filterButton {
            position: absolute;
            top: 40px;
            width: 80%;
        }
    }
    .config {
        padding: 10px;
        flex-basis: 0;
        flex-grow: 7;
        select {
            margin: 2px;
        }
    }
    .code {
        background-color: #D7D7D7;
        color: #484848;
        font-size: 11px;
        text-align: left;
        font-weight: 500;
        flex-basis: 0;
        flex-grow: 2;
    }
    label {
        display: block;
        font-weight: 500;
    }
    input[type="range"] {
        display: block;
        width: 100%;
    }
}

#save {
    background-color: white;
    border-color: black;
    margin: 0px auto 20px auto;
    width: 1000px;
    font-size: 16px;
    padding: 10px 4px;
}

#save:hover {
    background-color: #f4ffca;
}


  #logo {
      position: fixed;
      bottom: 20px;
      right: 20px;
      opacity: 0.5;
  }

  #logo:hover {
      opacity: 1;
  }
</style>