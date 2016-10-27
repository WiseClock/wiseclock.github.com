$(function()
{
    $('#generate').click(function(event)
    {
        generate();
    });

    $('#tscene').click(function(event)
    {
        insertToSkit('[', ']');
    });
    $('#temotion').click(function(event)
    {
        insertToSkit('(', ')');
    });
    $('#thint').click(function(event)
    {
        insertToSkit('【', '】');
    });
    $('#tcomment').click(function(event)
    {
        insertToSkit('{', '}');
    });

    $('#nameList').on('click', 'button', function(event)
    {
        event.preventDefault();
        toggleColor($(this).attr('data-hash'), $(this));
    });
    $('#result').on('click', '.name', function(event)
    {
        event.preventDefault();
        var hash = $(this).attr('data-hash');
        toggleColor(hash, $('.' + hash + '_b'));
    });
});

function toggleColor(hash, btn)
{
    var currentColor = $('.' + hash).css('background-color');
    if (typeof currentColor === 'undefined')
        $('.' + hash).css('background-color', 'rgba(0, 0, 0, 0)');
    else if (currentColor == 'rgba(0, 0, 0, 0)')
    {
        var rgb = hsl2rgb(getRandom(0, 40) / 40, 0.5, 0.8);
        var colorString = 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', 255)';
        $('.' + hash).css('background-color', colorString);
        btn.css('background-color', colorString);
        btn.css('color', 'black');
    }
    else
    {
        btn.css('background-color', '');
        btn.css('color', '');
        $('.' + hash).css('background-color', 'rgba(0, 0, 0, 0)');
    }
}

function getRandom(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hsl2rgb(h, s, l)
{
    var r, g, b;

    if (s == 0)
    {
        r = g = b = l;
    }
    else
    {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [parseInt(r * 255), parseInt(g * 255), parseInt(b * 255)];
}

function hue2rgb(p, q, t)
{
    if(t < 0) t += 1;
    if(t > 1) t -= 1;
    if(t < 1/6) return p + (q - p) * 6 * t;
    if(t < 1/2) return q;
    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

function insertToSkit(prefix, suffix)
{
    $('#skit').insertAtCaret(prefix);
    $('#skit').insertAtCaret(suffix);
    $('#skit').moveBack(1);
}

function generate()
{
    var nameList = [];
    var htmlBuilder = '';
    var lines;

    var textareaInput = $('#skit').val();
    if ($.trim(textareaInput) != '')
        lines = textareaInput.split('\n');
    else
        lines = $('#skit').attr('placeholder').split('\n');

    for (var i = 0; i < lines.length; i++)
    {
        var parts = splitNameAndSpeech(lines[i]);
        var name = parts[0];
        var speech = parts[1];
        var counter = i + 1;
        if (name != '')
            nameList.push(name);

        speech = buildKeyWords(speech);
        htmlBuilder += buildLineHTML(counter, name, speech);
    }

    nameList = nameList.filter(function(item, pos)
    {
        return nameList.indexOf(item) == pos;
    });
    $('#nameList').html(buildNamesHTML(nameList));
    $('#result').html(htmlBuilder);
}

function splitNameAndSpeech(line)
{
    var result = [];
    var parts = line.split(/[:：](.+)/);

    if ($.trim(parts[1]) == '')
    {
        result.push('');
        result.push($.trim(parts[0]));
    }
    else
    {
        result.push($.trim(parts[0]));
        result.push($.trim(parts[1]));
    }
    return result;
}

function buildKeyWords(speech)
{
    speech = speech.replace(/[\[［]([^\]］]*)[\]］]/g, '<span class="label label-info">$1</span>');
    speech = speech.replace(/[\(（]([^\)）]*)[\)）]/g, '<span class="label label-success">$1</span>');
    speech = speech.replace(/【([^】]*)】/g, '<span class="label label-danger">$1</span>');
    speech = speech.replace(/[\{｛]([^\}｝]*)[\}｝]/g, '<span class="label label-default">$1</span>');
    return speech;
}

function buildNamesHTML(nameList)
{
    var html = '';
    for (var i = 0; i < nameList.length; i++)
    {
        html += '<button type="button" class="btn ' + nameList[i].hashCode() + '_b" data-hash="' + nameList[i].hashCode() + '">' + nameList[i] + '</button>';
    }
    html += '<button type="button" class="btn other_b" data-hash="other">其他</button>';
    return html;
}

function buildLineHTML(number, name, speech)
{
    var hash = name.hashCode();
    if (name == '')
        hash = 'other';
    var line = '<div class="row line"><div class="cover ' + hash + '"></div>';
    line += '<div class="col-xs-2  col-sm-1">#' + number + '</div>';
    line += '<div class="col-xs-10 col-sm-2 col-md-1"><span class="name" data-hash="' + hash + '">' + name + '</span></div>';
    line += '<div class="col-xs-12 col-sm-9 col-md-10">' + speech + '</div>';
    line += '</div>\n';
    return line;
}

String.prototype.hashCode = function()
{
    var hash = '', i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        var codeHex = chr.toString(16).toUpperCase();
        hash += 'X' + codeHex;
    }
    return hash;
};

jQuery.fn.extend({
    insertAtCaret: function(myValue){
      return this.each(function(i) {
        if (document.selection) {
          //For browsers like Internet Explorer
          this.focus();
          var sel = document.selection.createRange();
          sel.text = myValue;
          this.focus();
        }
        else if (this.selectionStart || this.selectionStart == '0') {
          //For browsers like Firefox and Webkit based
          var startPos = this.selectionStart;
          var endPos = this.selectionEnd;
          var scrollTop = this.scrollTop;
          this.value = this.value.substring(0, startPos)+myValue+this.value.substring(endPos,this.value.length);
          this.focus();
          this.selectionStart = startPos + myValue.length;
          this.selectionEnd = startPos + myValue.length;
          this.scrollTop = scrollTop;
        } else {
          this.value += myValue;
          this.focus();
        }
      });
    },
    moveBack: function(myval) {
        var el = this[0], cur_pos = 0;

        if (el.selectionStart) {
            cur_pos = el.selectionStart;
        } else if (document.selection) {
            el.focus();

            var r = document.selection.createRange();
            if (r != null) {
                var re = el.createTextRange(),
                    rc = re.duplicate();
                re.moveToBookmark(r.getBookmark());
                rc.setEndPoint('EndToStart', re);

                cur_pos = rc.text.length;
            }
        }

        if (el.setSelectionRange) {
            el.focus();
            el.setSelectionRange(cur_pos-myval, cur_pos-myval);
        }
          else if (el.createTextRange) {
            var range = el.createTextRange();
            range.collapse(true);
            range.moveEnd('character', cur_pos-myval);
            range.moveStart('character', cur_pos-myval);
            range.select();
        }
    }
});
