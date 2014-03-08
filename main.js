/**
 * Created by kukulski on 3/3/14.
 */

var Main = (function(window) {
    var state = {
        heightFactor:3,
        flatWidth:1.5,
        limit:10
    };

    var updateOffset = function() {
        var f = state.field

        var ht = f.offsetHeight;
        var wd = f.offsetWidth;

        var baseShift = Math.min(wd,state.flatWidth*ht)
        var remainder = wd - baseShift;
        var attenuated = Math.sqrt(remainder);
        var foo = (remainder + attenuated)/2;
      //  var shifty = Math.max(0,wd-ht*state.heightFactor)
       // var altCenter = Math.sqrt(wd)
       // var rawCenter = wd/2;
       // var unShift = Math.max(0,wd-2*ht)/4;
       // var shift = rawCenter - unShift;
        f.style.left = -foo+'px';
    }


    var splits = [
      0,0,0, //012
      1,1,1, //345
      2,2,2,2,//6789
      3,3,3,3,3,3, //10-15
      4,4,4,4,4,4,4,4
    ];
    var tick = function() {

        var idx = state.index;
        idx = idx % state.words.length;
        idx++;
        state.index = idx;
        state.field.innerText = state.words[idx];


        var word = state.words[idx];

        var split = splits[word.length];
        var left = word.substr(0,split);
        var right = word.substr(split);

        state.left.innerHTML = left;
        state.right.innerHTML = right;





        updateOffset();
    }
    return {
        state:state,
        setSourceField:function(elt) {
            state.sourceField = elt;
        },
        setAlignment:function(place) {
            state.alignment = place;
        },

        hyphenateInto:function(str,arr) {
            if(str.length < state.limit) {
                arr.push(str);
                return;
            }
          var hyphanated = Hyphenator.hyphenate(str,"en");
            var fragments = hyphanated.split(String.fromCharCode(173));

            var line = null;

            for(var i = 0; i< fragments.length; i++) {
                var fragment = fragments[i];
                if(!line) {
                    line = fragment;
                    continue;
                }
                if(line.length + fragment.length < state.limit) {
                    line = line + fragment;
                    continue;
                }

                arr.push(line + '-');
                line = fragment;
           }
          if(line)
               arr.push(line);

        },

        setText:function(str) {
            state.index = 0;

//            str = Hyphenator.hyphenate(str,"en");
            str = str.replace(/ +/g,' ').replace(/[\r\n\t]+/g,'  ');

            var splitWords = str.split(' ');
            //state.words = splitWords;

            state.words = [];

            var words = state.words;

            splitWords.forEach(function(word) {
                    Main.hyphenateInto(word,words);
            })



        },
        setField: function(elt) {
            state.field = elt;

        },
        pause: function() {
            if(state.intervalHandle) {
                clearInterval(state.intervalHandle)
                state.intervalHandle = 0;
            }
        },
        back:function(delta) {
            var steps = Math.round(delta * state.wpm / 60) + 1;
            state.index = Math.max(0,state.index - steps);
            tick()
        },
        go:function() {
            if(state.intervalHandle) clearInterval(state.intervalHandle)
            state.intervalHandle = setInterval(tick,state.interval);
        },
        setRate: function(wpm) {
            state.wpm = wpm;
            var wpRefresh = wpm /3600;
            var ticksPerWord = Math.round(1/wpRefresh);
            this.setTicksPerWord(ticksPerWord)


        },
        setTicksPerWord:function(tpw) {
            state.ticksPerWord = tpw

            var wps = 60 /tpw
            var rounded = 60 * wps;

            var elt = document.getElementById("rate")
            if(elt) {elt.innerHTML = "" +Math.round(rounded)}

            state.interval = 1000/wps;

            if(state.intervalHandle) {
                clearInterval(state.intervalHandle)
                state.intervalHandle = setInterval(tick,state.interval);
            }
        },
        restart: function () {
            var txt = state.sourceField ? state.sourceField.value : "ho hum no field.";
            txt = txt || state.sourceField.innerText
            this.setText(txt);
            state.index = 0;
            this.go();

        },
        stop: function() {
            if(state.intervalHandle) clearInterval(state.intervalHandle)
            state.intervalHandle = 0
        },
        start: function() {
            var Main = this;

            state.left = document.getElementById("left");
            state.right = document.getElementById("right");


            Main.setField(document.getElementById("outField"))
            Main.setSourceField(document.getElementById("ourText"))
            Main.setRate(500);
            Main.setAlignment(200);
            Main.restart();



        },
        playPause: function () {
            if(state.intervalHandle) this.stop()
            else this.go()
        },
        keyCommands: {
            32: function() { Main.playPause()},
            38: function() { Main.setTicksPerWord(state.ticksPerWord-1)},
            40: function() { Main.setTicksPerWord(state.ticksPerWord+1)},
            37: function() { Main.back(1)},
            39: function() {Main.back(-1)}
        },
        onKey:function(event) {
           var fn = this.keyCommands["" + event.keyCode];
           if(typeof fn === "function") fn()
        }
    };
}(window));