# BASE32

基于BASE64的编码思想实现的固定长度编码，因为编码字符集只有32个，所以称为BASE32。

# 编码表

一般我们对数据进行编码时，首先要了解我们要进行编码的对象是什么。世界上现存的语言有成千上百种，操作系统类型也有很多。

通常的做法是将数据先转换成统一的字符集[Unicode](https://en.wikipedia.org/wiki/Unicode)。考虑到解码以后恢复数据的完整性问题，我们还需要将数据的Unicode码按照[UTF-8](https://en.wikipedia.org/wiki/UTF-8)编码进行编码，不然我们将在数据的Unicode码的洪流中迷失自我，找不到回家的路。

所以在拿到数据的UTF-8字符后，我们才要开始进行我们自己的数据加密编码。编码的对象便是明文数据一个一个的UTF-8字节。
	
我们了解到一个字节Byte有8个Bit位，在单字节编码的前提下，我们对数据加密编码的思想就是***原始数据的每个字节加入N位混淆比特数据***，这里1<=N<8。在保证原始数据不丢失的情况下，这样必然就造成了数据“扩充”：编码以后的数据长度将是原始数据的8/(8-N)倍。

接下来我们就可以使用查表的方式将加入混淆比特数据的字节映射成固定的字符，将每个字节映射后的固定字符都拼接到一块就得到了我们最终的编码结果。这里的关键在于我们查表方式如何选择我们的“码表”。我们可以思考一下，一个字节8位最大就是255，最小就是0。也就是我们的码表最大长度可以是256，但是我们如何定义256个不同的字符来组成码表呢？计算机领域通用的编码表是[ascii](https://en.wikipedia.org/wiki/ASCII)表,但是它的长度只有128，也就是一个字节的低7位。所以我们考虑把`0`比特位作为原始数据的混淆比特数据。它的作用有俩个：

1、混淆原始数据

2、降低原始数据编码表长度

所以原始数据的每个字节加入1个混淆比特数据`0`，那我们有效数据就只占7位了，对应的“码表”长度也只有128位了，可以完全使用ascii码表；

原始数据每个字节加入2个混淆比特数据`0`，那我们有效数据就只占6位了，对应的“码表”长度也只有64位了，可以使用ascii码表的部分字符；

依次类推，原始数据每个字节最多可以加入7个混淆比特数据`0`，那我们有效数据就只占1位了，对应的“码表”长度也就只有1位了，但这样极端的做法是没有任何意义的。

同样我们也可以思考一下为什么我们经常听到的是[Base64](https://en.wikipedia.org/wiki/Base64)，而不是Base128呢？这是因为ascii码表中除了常见的打印字符[a-zA-Z0-9]等等之外，还有一些控制字符。而这些控制字符并没有办法打印出来，对于编解码并不友好。所以主流的字节编码方式便选择了ascii码表中常见的64个打印字符来组成我们的“码表”。

还有一点考虑，那便是随着加入的混淆比特数据`0`越来越多，原始数据在一个字节中占的比特位也就越来越少了，相应的原始数据扩充的倍数也越来越大。经过编码以后的数据熵越来越小，噪音越来越多，也会更多地浪费带宽资源。综上所述，所以今天主流的BaseXX加密算法的编码表长度选择64位。

基于学术性而非工程的考虑，我们这篇文章将会从原理方面探讨Base32的实现方式。

## 编码

基于上部分所述，采用Base32的编码方式的话，原始数据的每个字节我们加入三个混淆比特位，便形成了`000X XXXX`的格式。因为5和8没有最小公约数，所以最终一定是按照每5个字节编码成为8个字节的格式进行编码。想要将原始数据的所有字节都进行编码，原始数据的字节长度就一定要是5的倍数。如果原始数据不是5的倍数，我们就参照Base64的方式，使用`=`来填充剩余的字节。存在以下几种情况

* 原始数据字节长度%5=1

  根据编码规则，我们将剩余的1个字节`XXXX XXXX`编码成为2个字节`000X XXXX | 000X XX00`，然后再填充6个`=`即可

* 原始数据字节长度%5=2

  根据编码规则，我们将剩余的2个字节`XXXX XXXX | XXXX XXXX`编码成为4个字节`000X XXXX | 000X XXXX | 000X XXXX | 000X 0000`，然后再填充4个`=`即可

* 原始数据字节长度%5=3

  根据编码规则，我们将剩余的3个字节`XXXX XXXX | XXXX XXXX | XXXX XXXX`编码成为5个字节`000X XXXX | 000X XXXX | 000X XXXX | 000X XXXX | 000X XXX0`，然后再填充3个`=`即可

* 原始数据字节长度%5=4

  根据编码规则，我们将剩余的4个字节`XXXX XXXX | XXXX XXXX | XXXX XXXX | XXXX XXXX`编码成为7个字节`000X XXXX | 000X XXXX | 000X XXXX | 000X XXXX | 000X XXXX | 000X XXXX | 000X X000`，最后再填充1个`=`即可

我们从ascii码表中可以任意选择32个打印字符，比如`a-z0-5`，然后根据每一个字节编码后的十进制数值从码表中拿出对应的字符。所有映射后的字符拼接一起就得到了最终的编码结果。

比如，我们我们对汉字"你"进行编码，首先得到“你”的UTF-8字节组 `0xE4 0xBD 0xA0`，转成二进制就是`11100100 10111101 10100000`。采用我们的Base32编码规则，得到5个字节`00011100 00010010 00011110 00011010 0000000`，对应十进制分别是`28 18 14 26 0`，查表得到`2os0a`，最后填充3个`=`得到最终编码结果就是`2os0a===`。

## 解码

了解了编码原理，其实解密很简单，按照编码规则反向操作就可以恢复原始数据的字节数组了。

1、我们拿到密文，先逐个字符查表得到十进制字节数组（这里注意填充字符`=`不在码表，如有直接忽略）

2、将十进制字节数组转成二进制字节数组，通过移位操作，把每个字节的混淆比特位去掉，恢复成原始数据的UTF-8编码字节数组

3、根据UTF-8解码规则，恢复成字符串。

比如，我们拿到密文字符串`2os0a===`，首先通过查表得到密文串的十进制数组`28 18 14 26 0`，遇到`=`直接忽略就好了，然后十进制数组转换成二进制字节数组是`00011100 00010010 00011110 00011010 0000000`。再按照Base32的规则解码后得到解码后的二进制字节数组`11100100 10111101 10100000`，也就是明文对应的UTF-8编码字节。最后按照UTF-8解码规则得到明文“你”。