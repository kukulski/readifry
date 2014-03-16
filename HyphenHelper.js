/**
 * Created by kukulski on 3/16/14.
 */

// required: Hyphenator.js & support files from http://code.google.com/p/hyphenator/
// required: language files must be loaded

HyphenHelper = (function(){

    var _targetWidth

    var _advance = function(fstate)
    {
        var str = fstate.str
        var done = fstate.fragments.length == 0
        var head = fstate.fragments[0]
        var rest = fstate.fragments.slice(1)
        var joined = fstate.work
        var trivial = str == null;

        var extended = str + head;
        var fits = extended.length < _targetWidth

        if(done) return {joined: joined.concat(str) }
        else if(fits) return { str: extended, fragments:rest, work: joined}
        else return {str: head, fragments:rest, work:joined.concat(str + '-')}
    }

    var _regroup = function(fragments)
    {
        var s = {str:"", fragments:fragments, work:[]};

        while (!s.joined) {
            s = _advance(s);
        }
        return s.joined;
    }



    return {
        language: 'en',

        init: function (targetWidth) {
            this.setTargetWidth(targetWidth)

            Hyphenator.config({
                displaytogglebox : true,
                minwordlength : 3
            });
        },
        setTargetWidth: function(wd) {
            _targetWidth = wd || 10
        },
        hyphenate : function(str) {

            if(str.length < _targetWidth) {
                return [str];
            }
            var hyphenated = Hyphenator.hyphenate(str,this.language);
            var fragments = hyphenated.split(String.fromCharCode(173));
            return _regroup(fragments);
        }
    }

})();

