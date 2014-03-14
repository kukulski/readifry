/**
 * Created by kukulski on 3/3/14.
 */

var Main = (function(window) {
    var state = {
        heightFactor:3,
        flatWidth:4,
        limit:9
    };

    var updateOffset = function() {
        var f = state.field

        var nWidth = f.offsetHeight/state.heightFactor;
        var ens = f.offsetWidth/nWidth;
      //  var attenuated = Math.sqrt(ens);
        var attenuated = Math.pow(ens,.6);
        //var baseShift = Math.min(ens,state.flatWidth)
        // var shiftyWidth = Math.max(baseShift,attenuated)
        var shiftyWidth = Math.min(ens,attenuated)

//        var remainder = ens - baseShift;
        var foo = shiftyWidth*nWidth/2;
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

        var idx = state.index+1;
        state.index = idx;
        state.field.innerText = state.words[idx] || "";

        if(!state.other.hidden){
        var word = state.words[idx];

        var split = splits[word.length];
        var left = word.substr(0,split);
        var right = word.substr(split);

        state.left.innerHTML = left;
        state.right.innerHTML = right;
        }




        updateOffset();
    }


    var Unhyph = (function(){

        var advance = function(fstate) {

            if(fstate.fragments.length == 0) {
                 return {
                     done: true,
                    joined: fstate.str? fstate.joined.concat(fstate.str): fstate.joined
                }
            }

            var str = fstate.str;
            var head = fstate.fragments[0];
            var rest = fstate.fragments.slice(1);

            if(str == null) {
             return {str:head, fragments:rest,joined:fstate.joined};
            }

            if(str.length + head.length > state.limit) {

             return {
                 str: head,
                 fragments:rest,
                 joined:fstate.joined.concat(str + '-')
            }
            }

            return {
                str: str + head,
                fragments: rest,
                joined: fstate.joined
            }
        }

        return function(fragments) {
            var s = {str:null, fragments:fragments, joined:[]};

            do {
                s = advance(s);
            } while (!s.done);

            return s.joined;
        }
    })();



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
          var hyphenated = Hyphenator.hyphenate(str,"en");
            var fragments = hyphenated.split(String.fromCharCode(173));


            var joined = Unhyph(fragments);
            joined.forEach(function(word) { arr.push(word)});

//
//
//
//            var line = null;
//
//            for(var i = 0; i< fragments.length; i++) {
//                var fragment = fragments[i];
//                if(!line) {
//                    line = fragment;
//                    continue;
//                }
//                if(line.length + fragment.length < state.limit) {
//                    line = line + fragment;
//                    continue;
//                }
//
//                arr.push(line + '-');
//                line = fragment;
//           }
//          if(line)
//               arr.push(line);

        },
        selectedFile:function(event) {
            if(event.target.files.length == 0) return;

            state.fr = new FileReader();
            state.fr.onloadend = function() {

                state.sourceField.value = state.fr.result;
                Main.setText(state.fr.result)
            }
            try{
                state.fr.readAsText(event.target.files[0])
            } catch(e) {
                console.log(e)
            }
        },


        stringHashCode: function(str){
            // http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
        var hash = 0;
        if (str.length == 0) return hash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
        },

    setText:function(str) {
            state.index = 0;

//            str = Hyphenator.hyphenate(str,"en");
            str = str
                .replace(/(\-+)/g,"$1 ") // dashes expand into spaces
                .replace(/[ \t]+/g,' ') // eliminate extra spaces
              ///  .replace(/([ \t]*[\r\n]+[ \t]*)+/g,'  ') // linefeed adds a beat
                .replace(/([.!?]+)\s+([A-Z])/g,"$1  $2") // "sentence" adds a beat

            state.hash = Main.stringHashCode(str)

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

        updateBookmark: function() {
            localStorage.setItem("index",state.index)
            localStorage.setItem("hash",state.hash)
        },
        getBookmark: function() {
            var hash = localStorage.getItem("hash") || 0;
            var index = localStorage.getItem("index") || 0;
            var matchingBookmark = (hash == state.hash)
            state.index = matchingBookmark ? index-1 : 0;
            if(matchingBookmark) tick();

            return matchingBookmark;
        },

    back:function(delta) {
            var steps = Math.round(delta * state.wpm / 60) + 1;
            state.index = Math.max(0,state.index - steps);
            tick()
        },
        go:function() {
            if(state.intervalHandle) clearInterval(state.intervalHandle)
            state.intervalHandle = setInterval(tick,state.interval)
            state.index = state.index % state.words.length
        },
        setRate: function(wpm) {
            state.wpm = wpm;
            localStorage.setItem("rate",wpm)
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

            Main.getBookmark() || Main.go();

        },
        stop: function() {
            if(state.intervalHandle) clearInterval(state.intervalHandle)
            state.intervalHandle = 0
            Main.updateBookmark();
        },
        start: function() {
            var Main = this;

            state.left = document.getElementById("left");
            state.right = document.getElementById("right");
            state.other = document.getElementById("other");


            Main.setField(document.getElementById("outField"))

            state.field.innerHTML = 'n';
            state.heightFactor = state.field.offsetHeight / state.field.offsetWidth;




            Main.setSourceField(document.getElementById("ourText"))
            Main.setRate(localStorage.getItem("rate") || 120);
            Main.setAlignment(200);



            Main.restart();



        },
        playPause: function () {
            if(state.intervalHandle) this.stop()
            else this.go()
        },
        hideShow: function(id) {
            var elt = document.getElementById(id);
            elt.hidden = !elt.hidden;

        },
        killMost: function(event) {
            if(event.keyCode == 13 && event.shiftKey) return;
       //    event.preventDefault();
            event.stopPropagation();

        },

        keyCommands: {
            32: function() { Main.playPause()},
            38: function() { Main.setTicksPerWord(state.ticksPerWord-1)},
            40: function() { Main.setTicksPerWord(state.ticksPerWord+1)},
            37: function() { Main.back(2)},
            39: function() {Main.back(-2)},
            84:function() {Main.hideShow("ourText")},

            65:function() {state.other.hidden = true, state.field.hidden = false},
            66:function() {state.other.hidden = false, state.field.hidden = true},
            72:function() {document.getElementById("help").hidden = true;
                document.getElementById("ourText").hidden = true;
                document.getElementById("controls").hidden = true;


            },
            76:function() {document.getElementById("loadFile").click()},

            191:function() {Main.hideShow("help")},
            8: function() {Main.hideShow("controls")}

        },
        onKey:function(event) {
           var fn = this.keyCommands["" + event.keyCode];
           if(typeof fn === "function") fn()
        }
    };
}(window));