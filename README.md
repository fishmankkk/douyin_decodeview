# 抖音去水印node后端代码

## 之前用了第三方接口很快就挂了，收费之后也没理会了很长一段时间；最近发现大家又出现了很多去水印功能的小程序，所以重新研究了一下；

## 获取无水印的视频原理步骤如下：

### 1.获取视频网页版下的item_ids,dytk两个参数；
### 2.调用抖音的接口https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${item_ids}&dytk=${dytk}，获取视频原链接；
### 3.replace('playwm','play')获取无水印视频链接；

##### 如果大家觉得有帮助可以star一下，多谢各位老哥
