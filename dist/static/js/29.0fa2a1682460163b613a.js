webpackJsonp([29],{63:function(i,e,s){var t=s(2)(s(807),s(888),function(i){s(844)},null,null);i.exports=t.exports},807:function(i,e,s){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var t=s(5);e.default={name:"",components:{},props:{user_id:{type:String,default:""},project_id:{type:String,default:""}},data:function(){return{risk_num:0,riskLeval:2,mobile:"13134567890",idnum:"410825199209227571",dataMessage:{},risk_info:{},risk_leval:0}},computed:{},watch:{$route:function(i,e){}},mounted:function(){var i=this;this.$route.query&&this.$route.query.userId?(this.user_id=this.$route.query.userId,this.project_id=this.$route.query.projectId,console.log("this.user_id==",this.user_id),this.getViolationreport()):setTimeout(function(){i.getViolationreport()},800)},methods:{getViolationreport:function(){var i=this,e={user_id:this.user_id,project_id:this.project_id};t.b({url:"/project/violation_report/get",type:"GET",data:e,timeout:6e5,success:function(e){if(0==e.errno){var s=e.data;i.dataMessage=s,i.risk_info=s.risk_info,i.risk_leval=i.risk_info.risk_level,console.log("this.risk_leval===",i.risk_info,i.risk_leval)}else i.$message({message:""+e.errmsg,type:"info"})},error:function(e,s){i.$message({showClose:!0,message:"网络连接失败，请检查网络",type:"warning"})},noNetwork:function(){i.$message({showClose:!0,message:"网络连接失败，请检查网络",type:"warning"})}})}}}},835:function(i,e,s){(i.exports=s(54)(!1)).push([i.i,".violation_wrap{width:100%;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}.violation{width:100%;background:#fff}.vio_header{width:100%;height:404px;background:url("+s(862)+") no-repeat 0 0;background-size:100% 68%;overflow:hidden}.logo{display:block;width:97px;height:48px;background:url("+s(876)+") no-repeat 0;margin:10px 0 0 30px}.vio-name{display:block;margin-top:39px;margin-left:36px}.vio_tile{font-family:PingFangSC-Medium;font-size:46px;letter-spacing:4px;margin-bottom:12px}.sub_num,.vio_tile{display:block;color:#fff}.sub_num{margin-bottom:8px}.sub_num,.sub_time{font-size:14px;margin-left:5px}.sub_time{display:block;color:#fff}.user-wrap{height:200px;background:#fff;border-radius:3px;width:92%;margin:0 auto;margin-top:31px;overflow:hidden}.user-mes{display:block;font-family:PingFangSC-Medium;font-size:24px;color:#565656;margin:18px 0 0 18px}.user-mess-box{display:-webkit-box;display:-ms-flexbox;display:flex;margin-top:15px;padding:10px 0;background:url("+s(878)+") no-repeat 50%;background-size:cover}.user_head{margin-right:10px}.user_head img{padding:0;font-size:0;width:96px}.user-name{line-height:20px;display:block;color:#404040;margin-top:20px}.user-name span{font-size:20px}.real_name{margin-right:30px}.user-idnum,.user-iphone{display:block;line-height:25px;font-size:14px;color:#404040}.user-iphone{background:url("+s(873)+") no-repeat 0;padding-left:19px;background-size:14px}.user-idnum{background:url("+s(870)+") no-repeat 0;padding-left:19px;width:14px;background-size:14px}.risk_wrap{background:#fff;width:92%;margin:10px auto}.risk_wrap .risk_title{font-size:24px;color:#565656}.risk_wrap .risk_message{width:100%;padding:0 5% 5px;box-sizing:border-box;margin:20px auto 0;border:1px dashed #e2ecfc}.mt{margin-top:40px}.risk_num_wrap{width:90%;height:48px;background:linear-gradient(180deg,#2ab7f5,#1791dd);display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;font-size:18px;border-radius:6px;margin:0 auto;margin-top:10px;position:relative;top:-25px}.risk_num_box{color:#ff0;font-size:24px;margin:0 5px}.risk_detail{display:-webkit-box;display:-ms-flexbox;display:flex;-ms-flex-flow:wrap;flex-flow:wrap}.risk_detail span{width:50%;display:block;box-sizing:border-box;line-height:25px;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center}.risk_detail .red_icon{background:url("+s(874)+") no-repeat 0;padding-left:19px;background-size:14px}.risk_detail .black_icon{background:url("+s(867)+") no-repeat 0;padding-left:19px;background-size:14px}.risk_detail .green_icon{background:url("+s(869)+") no-repeat 0;padding-left:19px;background-size:14px}.risk_message2{margin:0 auto;margin:20px 0 0;padding-bottom:10px;text-align:center;border:1px dashed #e2ecfc}.rick_type{margin:0 auto;font-size:16px;font-weight:700;display:block;height:60px;line-height:60px;position:relative}.risk_icon{width:100px;height:100px;position:absolute;right:40px;top:-30px}.risk_icon.free{background:url("+s(868)+") no-repeat 50%}.risk_icon.low{background:url("+s(871)+") no-repeat 50%}.risk_icon.zd{background:url("+s(875)+") no-repeat 50%}.risk_icon.medium{background:url("+s(872)+") no-repeat 50%}.risk_icon.highIcon{background:url("+s(865)+") no-repeat 50%}.risk_icon.highest{background:url("+s(866)+") no-repeat 50%}.risk_details{width:80%;margin:0 auto;border-radius:44px;height:88px;background:url("+s(863)+") no-repeat 0;background-size:cover;font-size:16px;color:#5e5e5e;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center}.bad_det{margin:0 10px;line-height:22px}.bad_messages_wrap{padding-bottom:20px;margin-top:20px;border:1px dashed #e2ecfc}.bad_messages_title{width:150px;height:40px;line-height:40px;font-size:20px;color:#fff;background:url("+s(864)+") no-repeat 0;background-size:cover;text-align:left;padding-left:22px;margin-bottom:20px}.bad_messages_title2{width:190px}.judicial_box{width:90%;margin:0 auto;margin-bottom:20px}.jud_title{height:40px;line-height:40px;text-align:center;font-size:14px;color:#fff;background:linear-gradient(270deg,#0c60ff,#76cff2)}.jud_section{-ms-flex-wrap:wrap;flex-wrap:wrap}.jud_section,.section_line{display:-webkit-box;display:-ms-flexbox;display:flex}.section_line{width:50%;min-height:30px;line-height:30px;border-bottom:1px solid #cbe0ff}.bgClass{background:#e7f0ff}.line_width{width:100%}.section_line span{-webkit-box-flex:1;-ms-flex:1;flex:1;text-align:center;border-right:1px solid #cbe0ff;font-size:12px;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}.line_border:nth-child(2n) span:first-child,.section_line:nth-child(2n-1) span:first-child{border-left:1px solid #cbe0ff}.line_border:nth-child(2n){background:#e7f0ff}.section_line2{width:100%;display:-webkit-box;display:-ms-flexbox;display:flex;min-height:30px;line-height:30px;border-bottom:1px solid #cbe0ff}.section_line2:nth-child(2n){background:#e7f0ff}.section_line2 span{border-right:1px solid #cbe0ff;text-align:center;font-size:12px}.section_line2 span,.section_line2 span:first-child{-webkit-box-flex:1;-ms-flex:1;flex:1}.section_line2 span:first-child{border-left:1px solid #cbe0ff}.footer{text-align:center;font-size:12px;color:#404040;margin-top:50px;margin-bottom:35px}",""])},844:function(i,e,s){var t=s(835);"string"==typeof t&&(t=[[i.i,t,""]]),t.locals&&(i.exports=t.locals);s(55)("64fff813",t,!0)},862:function(i,e,s){i.exports=s.p+"static/img/bg_header@1x.512b402.png"},863:function(i,e,s){i.exports=s.p+"static/img/bg_red@1x.9b98372.png"},864:function(i,e){i.exports="data:image/png;base64,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"},865:function(i,e,s){i.exports=s.p+"static/img/high_icon@1x.4fe7340.png"},866:function(i,e,s){i.exports=s.p+"static/img/highest@1x.a05265c.png"},867:function(i,e){i.exports="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAABHNCSVQICAgIfAhkiAAAAPJJREFUOI3VkSEOwkAQRR/skFRWIBAIBDgc10BwBEQ9BtFb9ALcAMU5sCSQ9AAIBAJRQ7IItsm0DG0d4Seb7P6/8+fPLvwLJgKZg1zAC/iwz4BJJ4cBJAKFMtg52JVngWIASZvJWhV4AV9qdb7JbKyTtBkJFHrMvrq4BaJO878RCWw+WIGz0dUDQyC2NIFzWd/T0a22T5gFPf+i94Kuucq5bDDtMqcuvABz484ClbyGk2V0+GKUNgQ5WORI4G486D6sOv8ARqa9g5XxaxHvr67wDlYNScHBUidzsHfVRPdWE4VYIBU4ClwFbmGfAnFXk9/iBV6CV4Uz51bpAAAAAElFTkSuQmCC"},868:function(i,e,s){i.exports=s.p+"static/img/icon_free@1x.7108f3d.png"},869:function(i,e){i.exports="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAABHNCSVQICAgIfAhkiAAAAXZJREFUOI3NlL9LQlEYhp9ztbyKQ0NDg3+AYw2hQ0GCg2SuJUTUVksgRJibTSrREAQmDRE1tAWJ5FaLVFOO/hENDUlKV0+DP+696r06+sKBj+8778N7OIcD0yphOSmerKGwiySIQEXSQPBOm1ti2dfJYMWjeZSZOyBiE6JM+2+H2PmXNewxMces+gb4bUA91airy2ymf3oNxTR2ua4nBAH48f7ejE5WOl4Ex+dYhOQWcCLY7jRaS0TPquZk0hEfH0ZesJHdA1nWe86tXqXDFAKGwNXOGgBFcwmekisg8vpWGRyGSeHt1+3WKXXXKlAZAiniGYF3lM9wAfJbT6nkcTd91NUIgkNL0IDPeJsVQ72AIl9wN32sZy+tQWafDtO4B7QhYCmVsQFpXR8w+GhLySsQ+yNMFpIFormD4WQAHncC83HtVOnu78sMC6UbeNQwyALmIxulgSzgUcOE0g3jwObXSPlRZBwI9H8N+KAtHohlahOmnxL9A23zb4hQB7hiAAAAAElFTkSuQmCC"},870:function(i,e){i.exports="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAABHNCSVQICAgIfAhkiAAAASJJREFUKJHFkaFOA1EQRc+8blODQCIQlZAgNm9e0uBAVJDwB0hwpBpFCOED+AEkCcHjkWB2s2lIEAgqEBUVJcE0u9vBtNAspakhXDczOXdyZ+C/JABxHDdFxJaFzOw9y7Jh1Gq11ouieAYel2RXzWwAtKPRaBQ55/ppmu4uQ4YQdoAzgGh2oKpHwAUwyPN8r9vtvi0ycpX6pCzLTeC2Xq8fAHjvb7z3r6r6UoWjSv1Uq9UugdjMTgFEpFOW5Uqj0Sh+hVV1AwjANdATkUPgzsz2nXPNPM/x3g+B7AdsZscicp4kydXE7CGEsDUej/tfGZ37mLs5TdPO7CBJku1plNn+5NrfsIisqep9NdM8mdn0z0RZlvVUtS0i1eMtMlj4wr/XJ1oKZ+kAVBdQAAAAAElFTkSuQmCC"},871:function(i,e,s){i.exports=s.p+"static/img/icon_low@1x.f6ac0f6.png"},872:function(i,e,s){i.exports=s.p+"static/img/icon_medium@1x.4ea06e4.png"},873:function(i,e){i.exports="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAOCAYAAADwikbvAAAABHNCSVQICAgIfAhkiAAAAL1JREFUKJG10qGKQkEYxfGfYjQYjYIvcMMGBYPgwhajxTcwbFzYFzAIhn0I8Q02bHCTZcGg3WAWDIaNGwz3E0RE75X1pGGYc/7nmxn+URUk9xrXWOAji6F4sn7GDM2g9/KYy9jhD1N0MvUNJZijhA1qeciroD9FwG8eMrSxxCBaVGK/gZfzw4ULASPU8Y33aFSV3gf0b7UaSp+si5Z0DHjD5Br5qBbGQfnEPsK2eL1lPiqR/oEyfvCVwfNgHQDEcxzhNCHStwAAAABJRU5ErkJggg=="},874:function(i,e){i.exports="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAASCAYAAAC5DOVpAAAABHNCSVQICAgIfAhkiAAAAcVJREFUOI3Nk8FKG1EYhc9/J9FccIoUK1100UUXWRhtiAoFhfENCm0RQZeF9gl8hS7ctw/QTXHRVam7CCKCScBqFrNwmUWQFApG7gTu3NNFE3uTSdCl/27OnPtxzp1/gIc6Mk6sRlFuPkk2U+e2ReQlgKcA2iTPAqW+XhUK3zYOD+2dsPNKpSj5/D7IhckRpGnTdKdcq51NhJ1XKkUJghOIzN6jVZfWriw2GvFAUH41yef3PVAXQDICSDxtRnK579UoKmRgT4x5O1SN3KK1ZQDtvtKmtWWQ7zx48bExrzMwAG/8CCKyGxjTUkqtg/xCazcCY1oisuv7FLA5DvbCNxFYc2FYvZqebpVOTz/+DsNLhuFPAmsj1YsZGIHMpwYw4z84QI/x+Cn7tYDLkXfHPWvX529uZi9WVz8/6vWeB9fXEYBj3yTA7Xr4yX74JpJ7U8CcU6oGkQ9Tzh2lWj8D+WnI55273bNqFOXmjLnA/zvojqma4N91DLS4o3Vp8DcMLe2v5eUFFQQnI4BJM3lpAWCpXm/S2hUAcebo8MQuTV/5oAwMABYbjbijdcmR74U8APmnX6Ej5AGAnY7WpaV6vXmP9A9k/gKII7K1s9gsXQAAAABJRU5ErkJggg=="},875:function(i,e,s){i.exports=s.p+"static/img/icon_zd@1x.0f3a891.png"},876:function(i,e){i.exports="data:image/png;base64,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"},877:function(i,e){i.exports="data:image/png;base64,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"},878:function(i,e,s){i.exports=s.p+"static/img/user_bg@1x.a148403.png"},888:function(i,e,s){i.exports={render:function(){var i=this,e=i.$createElement,s=i._self._c||e;return s("div",{staticClass:"violation_wrap"},[s("div",{staticClass:"violation"},[s("div",{staticClass:"vio_header"},[s("span",{staticClass:"logo"}),i._v(" "),s("span",{staticClass:"vio-name"},[s("span",{staticClass:"vio_tile"},[i._v("信用报告")]),i._v(" "),s("span",{staticClass:"sub_num"},[i._v("报告编号："+i._s(i.dataMessage.report_number))]),i._v(" "),s("span",{staticClass:"sub_time"},[i._v("报告时间："+i._s(i.dataMessage.report_time))])]),i._v(" "),s("div",{staticClass:"user-wrap"},[s("span",{staticClass:"user-mes"},[i._v("用户信息")]),i._v(" "),s("div",{staticClass:"user-mess-box"},[i._m(0),i._v(" "),s("div",{staticClass:"user-det"},[s("span",{staticClass:"user-name"},[s("span",{staticClass:"real_name"},[i._v(i._s(i.dataMessage.real_name))]),i._v(" "),s("span",[i._v(i._s(i.dataMessage.age))])]),i._v(" "),s("span",{staticClass:"user-iphone"},[i._v("\n              "+i._s(i.dataMessage.mobile)+"\n              ")]),i._v(" "),s("span",{staticClass:"user-idnum"},[i._v("\n              "+i._s(i.dataMessage.idnumber)+"\n              ")])])])])]),i._v(" "),s("div",{staticClass:"risk_wrap"},[s("h4",{staticClass:"risk_title"},[i._v("风险提醒")]),i._v(" "),s("div",{staticClass:"risk_message"},[s("div",{staticClass:"risk_num_wrap"},[i._v("本次报告命中·"),s("em",{staticClass:"risk_num_box"},[i._v(i._s(i.dataMessage.hit_fx_num))]),i._v("·条异常规则信息")]),i._v(" "),s("div",{staticClass:"risk_detail"},i._l(i.dataMessage.fx_list,function(e,t){return s("span",{key:t,class:[1==e.hit_status?"red_icon":2==e.hit_status?"green_icon":3==e.hit_status?"black_icon":""]},[i._v(i._s(e.title)+i._s(e.remark))])}),0)])]),i._v(" "),s("div",{staticClass:"risk_wrap mt"},[s("h4",{staticClass:"risk_title"},[i._v("风险情况总览")]),i._v(" "),i.risk_info.risk_title?s("div",{staticClass:"risk_message2"},[s("div",{staticClass:"bad_messages_title"},[i._v("不良信息")]),i._v(" "),s("div",{staticClass:"rick_type"},[i._v("\n          "+i._s(i.risk_info.risk_title)+"包括但不限于以下几种：\n          "),s("div",{staticClass:"risk_icon",class:[1==i.risk_leval?"highest":2==i.risk_leval?"highIcon":3==i.risk_leval?"medium":4==i.risk_leval?"zd":5==i.risk_leval?"low":6==i.risk_leval?"free":""]})]),i._v(" "),s("div",{staticClass:"risk_details"},[s("span",{staticClass:"bad_det"},[i._v(i._s(i.risk_info.remarks))])])]):i._e(),i._v(" "),i.dataMessage.sfss_list&&i.dataMessage.sfss_list.length>0?s("div",{staticClass:"bad_messages_wrap"},[s("div",{staticClass:"bad_messages_title"},[i._v("司法涉诉")]),i._v(" "),i._l(i.dataMessage.sfss_list,function(e,t){return s("div",{key:t,staticClass:"judicial_box"},[s("div",{staticClass:"jud_title"},[i._v(i._s(e.title))]),i._v(" "),s("div",{staticClass:"jud_section"},[i._l(e.list,function(t,a){return e.list.length%2==0?s("div",{key:a,staticClass:"section_line",class:[parseInt(a/2)%2!=0?"bgClass":""]},[s("span",{staticClass:"span1"},[i._v(i._s(t.title))]),i._v(" "),s("span",{staticClass:"span2"},[i._v(i._s(t.num))])]):i._e()}),i._v(" "),i._l(e.list,function(t,a){return e.list.length%2!=0?s("div",{key:a,staticClass:"section_line line_width line_border"},[s("span",{staticClass:"span1"},[i._v(i._s(t.title))]),i._v(" "),s("span",{staticClass:"span2"},[i._v(i._s(t.num))])]):i._e()})],2)])})],2):i._e(),i._v(" "),i.dataMessage.other_list&&Object.keys(i.dataMessage.other_list).length>0?s("div",{staticClass:"bad_messages_wrap"},[s("div",{staticClass:"bad_messages_title bad_messages_title2"},[i._v("其他案件概览")]),i._v(" "),s("div",{staticClass:"judicial_box"},[s("div",{staticClass:"jud_title"},[i._v(i._s(i.dataMessage.other_list.title))]),i._v(" "),s("div",{staticClass:"jud_section"},i._l(i.dataMessage.other_list.list,function(e,t){return s("div",{key:t,staticClass:"section_line2"},[s("span",{staticClass:"span1"},[i._v(i._s(e.title))]),i._v(" "),s("span",{staticClass:"span2"},[i._v(i._s(e.num))])])}),0)])]):i._e()]),i._v(" "),s("div",{staticClass:"footer"},[i._v("\n      最终解释权归斗米所有\n    ")])])])},staticRenderFns:[function(){var i=this.$createElement,e=this._self._c||i;return e("div",{staticClass:"user_head"},[e("img",{attrs:{src:s(877),alt:""}})])}]}}});