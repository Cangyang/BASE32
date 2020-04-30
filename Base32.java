import java.nio.charset.Charset;

/**
 * Author cangyang
 *
 * Based on the Algorithm of Base64
 *
 */
public class Base32 {
    public static final String KEY_STR = "abcdefghijklmnopqrstuvwxyz012345=";

    public static String encode(String plainText){
        String encryptStr = "";
        byte[] origins = plainText.getBytes(Charset.forName("UTF-8"));
        byte[] chars;
        if(origins.length % 5 != 0){
            chars = new byte[5*(origins.length / 5 + 1)];
            System.arraycopy(origins,0,chars,0,origins.length);
            System.arraycopy(new byte[]{(byte)0,(byte)0,(byte)0,(byte)0},0,chars,origins.length,5-(origins.length % 5));
        }else {
            chars = origins;
        }
        int i = 0;
        int p1,p2,p3,p4,p5,e1,e2,e3,e4,e5,e6,e7,e8;
        while(i < chars.length){
            p1 = chars[i++] & 255;
            p2 = chars[i++] & 255;
            p3 = chars[i++] & 255;
            p4 = chars[i++] & 255;
            p5 = chars[i++] & 255;
            e1 = p1 >>> 3;
            e2 = ((p1 & 0x07) << 2) | (p2 >>> 6);
            e3 = (p2 & 0x3F) >>> 1;
            e4 = ((p2 & 0x01) << 4) | (p3 >>> 4);
            e5 = ((p3 & 0x0F) << 1) | (p4 >>> 7);
            e6 = (p4 & 0x7F) >>> 2;
            e7 = ((p4 & 0x03) << 3) | (p5 >>> 5);
            e8 = p5 & 0x1F;
            if(p2 == 0){
                e3 = e4 = e5 = e6 = e7 = e8 = 0x20;
            }else if(p3 == 0){
                e5 = e6 = e7 = e8 = 0x20;
            }else if(p4 == 0){
                e6 = e7 = e8 = 0x20;
            }else if(p5 == 0){
                e8 = 0x20;
            }
            encryptStr = encryptStr
                    + KEY_STR.charAt(e1)
                    + KEY_STR.charAt(e2)
                    + KEY_STR.charAt(e3)
                    + KEY_STR.charAt(e4)
                    + KEY_STR.charAt(e5)
                    + KEY_STR.charAt(e6)
                    + KEY_STR.charAt(e7)
                    + KEY_STR.charAt(e8);
        }
        return encryptStr;
    }

    public static String decode(String encryptStr){
        byte[] plainArray = new byte[encryptStr.length()*5/8];
        int i = 0,j=0;
        byte p1,p2,p3,p4,p5,e1,e2,e3,e4,e5,e6,e7,e8;
        while(i < encryptStr.length()){
            e1 = (byte)KEY_STR.indexOf(encryptStr.charAt(i++));
            e2 = (byte)KEY_STR.indexOf(encryptStr.charAt(i++));
            e3 = (byte)KEY_STR.indexOf(encryptStr.charAt(i++));
            e4 = (byte)KEY_STR.indexOf(encryptStr.charAt(i++));
            e5 = (byte)KEY_STR.indexOf(encryptStr.charAt(i++));
            e6 = (byte)KEY_STR.indexOf(encryptStr.charAt(i++));
            e7 = (byte)KEY_STR.indexOf(encryptStr.charAt(i++));
            e8 = (byte)KEY_STR.indexOf(encryptStr.charAt(i++));
            p1 = (byte)((e1 << 3) | (e2 >>> 2));
            p2 = (byte)(((e2 & 0x03) << 6) | (e3 << 1) | (e4 >>> 4));
            p3 = (byte)(((e4 & 0x0F) << 4) | (e5 >>> 1));
            p4 = (byte)(((e5 & 0x01) << 7) | (e6 << 2) | (e7 >>> 3));
            p5 = (byte)(((e7 & 0x07) << 5) | e8);
            plainArray[j++] = p1;
            if(e3 != 0x20){
                plainArray[j++] = p2;
            }
            if(e5 != 0x20){
                plainArray[j++] = p3;
            }
            if(e6 != 0x20){
                plainArray[j++] = p4;
            }
            if(e8 != 0x20){
                plainArray[j++] = p5;
            }
        }
        return new String(plainArray, Charset.forName("UTF-8"));
    }

    public static void main(String[] args) {
        String plainText = "你";
        String encryptStr = encode(plainText);
        System.out.println(encryptStr);
        String decryptStr = decode(encryptStr);
        System.out.println(decryptStr);

    }
}
