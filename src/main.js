// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// import 'babel-polyfill'

import Vue from 'vue'
import store from './store/index'

//import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'

import App from './App'
import router from './router'

import hevueImgPreview from 'hevue-img-preview'
Vue.use(hevueImgPreview)

// import VuePreview from 'vue-preview'
// Vue.use(VuePreview)

import { VueTracker } from '@doumi/tracker'
Vue.use(VueTracker)


//Vue.use(ElementUI)

Vue.config.productionTip = false
function setCookies(cookieString) {
	// 按分号分割字符串，得到每个单独的 Cookie
	const cookies = cookieString.split(';');
	
	// 遍历每个 Cookie
	cookies.forEach(cookie => {
			// 去除前后空格
			cookie = cookie.trim();
			if (cookie) {
					// 设置 Cookie
					document.cookie = cookie + "; path=/";
			}
	});
}

// 示例：批量设置 Cookie
const cookieString = "b_web_citydomain=bj; dmb_loginfrom=vip; dmb_from=direct_visits; bdid=0; ganji_uuid=9526057177081344314642; dm_uuid=0207ecf2-1a6b-11ef-b043-1418774d6214; Hm_lvt_5ce0ad453d8e97ccbaafe0027ce9e106=1716892807; c_citydomain=xinxiang; goldmine_melon=eyJpdiI6Ik9ZRUZSK0dDZU9kbTRvQTlMRVh3aGc9PSIsInZhbHVlIjoiOFZWYUVjdUZYWld5djNWY0tISVBhZ0lEWGVvM2hpY005dWZZNzNKdzhlV2dUUFd2bEhQdXhZMUtcL3lhWG5SYnplMUNoTnc2T2FhWDNXb3dkd1YrazB3PT0iLCJtYWMiOiJkNTgwMjJkZDlkY2E4YmNjNzAwN2I4ZGJkYzljY2E2NGE3OTlhMzJlY2ViN2UwZjk1NGU3MzgyYzI3YWEyNWQ3In0%3D; cid=10204; is_active=1; related_bd_id=2; dmb_uuid=bweb67d7c7184c9247c20e2dce397c958bf3; is_first=3; ganji_jz_melon_uuid=eyJpdiI6IjZKbVhlWTdSdTNLTHFnZUh4T0lRbVE9PSIsInZhbHVlIjoiM0JGTHh5aktSZ2VuUU0xSDZhM1YyNUJHaVBIUktyblIxRTl3SEhaaVhRR0dHOEpORVNYM1JIbisxQndwbG03VCIsIm1hYyI6IjhjZTYwZmUyOGNhNjY5Y2Y1MzdhNzRmMjRlNWE5NmJhMWE0MWIxOWQxMDYyNGQ1MTAyNjk2YTZlZmRhMTI0YWYifQ%3D%3D; ganji_jz_wc_jzuid=eyJpdiI6IklxRE12V3JqMzN3M0xtSzRGOHE3Vmc9PSIsInZhbHVlIjoiUVltKzBsK2hkZkZndzZhTGYwQjhDUT09IiwibWFjIjoiNTU2YzBlMzI0OGUwZjI0ODYzNzNlYjE2YjFiM2Q5ODMxN2ZjN2EwNTZiOWE0YmNlYzc1MmRmMDAxMjgzMjZlNCJ9; ganji_jz_login_source=eyJpdiI6Inl2cmUzXC91VW85T09JNzVsOXRtMkdnPT0iLCJ2YWx1ZSI6InljRVVmZUZjVXNkRzV4QklVVmhVUTMybUJtRmJsUGxUYWFndnNJXC9vaWVIQUFqR2RqNnhkdnBQc0RMRVBhUnJPS0tVNHI5ekdhaW91aTluYUZPNmlLNUhwUUJMSGtFOW9HNWw2UldQMDVrNGdQQkY5U21PbnVMQTBrbHY5VmZHREJaQkhCME0zY09nSFhDd2hOS094QlE9PSIsIm1hYyI6Ijg4YzA5MTg4NWE0OGM2ZTUyMzUzZTJjZjgyYWE0YjgxNmY4YjY3NzYxMGM4YTc1YzI3YmI3MWM5MTYzYjg0YTAifQ%3D%3D; dmb_userid=71355917; 5434_module=0; left_side_id=xuanyuan_wagereport_list; doumi_melon=eyJpdiI6IlwvVm1OeHB2dVJFNGdyT3Z1c0ZzeVZRPT0iLCJ2YWx1ZSI6IjBNYzlEOHVtdVBVTUpDdlwvWFRTTHlSWFhVVWUyRGdLWEk5SEgyNjVYOVY0Rnk0dUpRNGJ4RzFVVFZiTHB0eEdhMDl1RUp5amN3Y21GYzE3dDYycW1PQT09IiwibWFjIjoiNWFiNTE5NTYwZDdlZTE1MzE1NDI2MzdhMDE0NDc1NzU1NGVlYjcwOWRkZDcwMzUxNWY0MDE3NGUyYWQzYmI3ZSJ9";
setCookies(cookieString);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
	store:store,
  template: '<App/>',
  components: { App }
})

Vue.component('my-item-zh', {
	functional: true,
	render: function (h, ctx) {
	  var item = ctx.props.item;
	  if(item.status == -1){
	     return h('div', ctx.data, [
	        h('div', { attrs: { class: 'seach-empty' } }, [item.value]),
	      ]); 
	  }else{
	    return h('li', ctx.data, [
	      h('div', { attrs: item.status == -1 ? { class: 'seach-empty' } : { class: 'name' } }, [item.value]),
	      h('span', { attrs: item.status == '已结束' ? { class: 'addr' } : ''}, [item.status])
	    ]);
	  }
	},
	props: {
	  item: { type: Object, required: true }
	}
});


