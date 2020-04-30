/**
 * Author cangyang
 * Based on the Algorithm of Base64
 **/

function Base32(){
    _keyStr = "abcdefghijklmnopqrstuvwxyz012345=";
    this.encode = function(string){
        var array = _utf8_encode(string);
        var result = "";
        var char1,char2,char3,char4,char5,enc1,enc2,enc3,enc4,enc5,enc6,enc7,enc8;
        var i = 0;
        while(i < array.length){
            char1 = array[i++];
            char2 = array[i++];
            char3 = array[i++];
            char4 = array[i++];
            char5 = array[i++];
            enc1 = char1 >>> 3;
            enc2 = ((char1 & 0x07) << 2) |  (char2 >>> 6);
            enc3 = (char2 & 0x3F) >>> 1;
            enc4 = ((char2 & 0x01) << 4) | (char3 >>> 4);
            enc5 = ((char3 & 0x0F) << 1) | (char4 >>> 7);
            enc6 = (char4 & 0x7F) >>> 2;
            enc7 = ((char4 & 0x03) << 3) | (char5 >>> 5);
            enc8 = char5 & 0x1F;
            if(isNaN(char2)){
                enc3 = enc4 = enc5 = enc6 = enc7 = enc8 = 0x20;
            }else if(isNaN(char3)){
                enc5 = enc6 = enc7 = enc8 = 0x20;
            }else if(isNaN(char4)){
                enc6 = enc7 = enc8 = 0x20;
            }else if(isNaN(char5)){
                enc8 = 0x20;
            }
            result = result + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4) + _keyStr.charAt(enc5) + _keyStr.charAt(enc6) + _keyStr.charAt(enc7) + _keyStr.charAt(enc8);
        }
        return result;
    }
    this.decode = function(input){
        var result = [];
        var char1,char2,char3,char4,char5,enc1,enc2,enc3,enc4,enc5,enc6,enc7,enc8;
        var i = 0;
        while(i < input.length){
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            enc5 = _keyStr.indexOf(input.charAt(i++));
            enc6 = _keyStr.indexOf(input.charAt(i++));
            enc7 = _keyStr.indexOf(input.charAt(i++));
            enc8 = _keyStr.indexOf(input.charAt(i++));
            char1 = (enc1 << 3) | (enc2 >>> 2);
            char2 = ((enc2 & 0x03) << 6) | (enc3 << 1) | (enc4 >>> 4);
            char3 = ((enc4 & 0x0F) << 4) | (enc5 >>> 1);
            char4 = ((enc5 & 0x01) << 7) | (enc6 << 2) | (enc7 >>> 3);
            char5 = ((enc7 & 0x07) << 5) | enc8;
            result.push(char1);
            if(enc3 != 0x20){
                result.push(char2);
            }
            if(enc5 != 0x20){
                result.push(char3);
            }
            if(enc6 != 0x20){
                result.push(char4);
            }
            if(enc8 != 0x20){
                result.push(char5);
            }
        }
        return _utf8_decode(result);
    }
    _utf8_encode = function(str){
        var result = [];
        for(var ch of str){
            var cha = ch.charCodeAt(0);
            if(cha <= 0x7F){
                result.push(cha);
            }else if(cha <= 0x7FF){
                result.push(0xC0|0x1F&(cha>>>6));
                result.push(0x80|0x3F&cha);
            }else if(cha <= 0xFFFF){
                result.push(0xE0|0x0F&(cha>>>12));
                result.push(0x80|0x3F&(cha>>>6));
                result.push(0x80|0x3F&cha);
            }else if(cha <= 0x1FFFFF){
                result.push(0xF0|0x07&(cha>>>18));
                result.push(0x80|0x3F&(cha>>>12));
                result.push(0x80|0x3F&(cha>>>6));
                result.push(0x80|0x3F&cha);
            }else if(cha <= 0x3FFFFFF){
                result.push(0xF0|0x0B&(cha >>> 24));
                result.push(0x80|0x3F&(cha >>> 18));
                result.push(0x80|0x3F&(cha >>> 12));
                result.push(0x80|0x3F&(cha >>> 6));
                result.push(0x80|0x3F&cha);
            }else if(cha <= 0x7FFFFFFF){
                result.push(0xF0|0x0D&(cha >>> 31));
                result.push(0x80|0x3F&(cha >>> 24));
                result.push(0x80|0x3F&(cha >>> 18));
                result.push(0x80|0x3F&(cha >>> 12));
                result.push(0x80|0x3F&(cha >>> 6));
                result.push(0x80|0x3F&cha);
            }
        }
        return result;
    }
    _utf8_decode = function(array){
        var result = "";
        for(var i = 0; i < array.length; i ++){
            var code = array[i];
            if(code >=0 && code <= 0x7F){
                code = 0x7F & code;
            }
            else if(code <= 0xDF){
                code = ((0x1F & array[i]) << 6) | (0x3F & array[++i]);
            }
            else if(code <= 0xEF){
                code = ((0x0F & array[i]) << 12) | ((0x3F & array[++i]) << 6) | (0x3F & array[++i]);
            }
            else if(code <= 0xF7){
                code = ((0x07 & array[i]) << 18) | ((0x3F & array[++i]) << 12) | ((0x3F & array[++i]) << 6) | (0x3F & array[++i]);
            }
            else if(code <= 0xFB){
                code = ((0x03 & array[i]) << 24) | ((0x3F & array[++i]) << 18) | ((0x3F & array[++i]) << 12) | ((0x3F & array[++i]) << 6) | (0x3F & array[++i]);
            }
            else if(code <= 0xFD){
                code = ((0x01 & array[i]) << 30) | ((0x3F & array[++i]) << 24) | ((0x3F & array[++i]) << 18) | ((0x3F & array[++i]) << 12) | ((0x3F & array[++i]) << 6) | (0x3F & array[++i]);
            }
            var cha = String.fromCharCode(code);
            result += cha;
        }
        return result;
    }
}