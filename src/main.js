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
const cookieString = "b_web_citydomain=bj; dmb_loginfrom=vip; dmb_from=direct_visits; bdid=0; ganji_uuid=9526057177081344314642; dm_uuid=0207ecf2-1a6b-11ef-b043-1418774d6214; Hm_lvt_5ce0ad453d8e97ccbaafe0027ce9e106=1716892807; dm_fm=direct_visits; c_citydomain=xinxiang; ganji_jz_melon_uuid=eyJpdiI6IlhtRG10M2VXdUxWMU9FVldHWndMQXc9PSIsInZhbHVlIjoiZ0RIbUtFcmVcL3RxTFNXWEpBc1NvdkpBMWh2Nk5oVlRpdnJEM3RiZjROdm8xbW5JVVlqcmY4TTFraFE2d1ZWXC9IIiwibWFjIjoiYmFlODNiMmIwOWZiZWY0MTBlYTc2YzFjMjJjNmMyYzM3Yzg2MjcxN2UxNzBlZDFjOTFkZGFjYzA0MWM1ZDJhNyJ9; goldmine_melon=eyJpdiI6Ik9ZRUZSK0dDZU9kbTRvQTlMRVh3aGc9PSIsInZhbHVlIjoiOFZWYUVjdUZYWld5djNWY0tISVBhZ0lEWGVvM2hpY005dWZZNzNKdzhlV2dUUFd2bEhQdXhZMUtcL3lhWG5SYnplMUNoTnc2T2FhWDNXb3dkd1YrazB3PT0iLCJtYWMiOiJkNTgwMjJkZDlkY2E4YmNjNzAwN2I4ZGJkYzljY2E2NGE3OTlhMzJlY2ViN2UwZjk1NGU3MzgyYzI3YWEyNWQ3In0%3D; left_side_id=left_cuser_list; 5434_module=7; cid=10204; is_active=1; related_bd_id=2; ca_source=-; ca_name=-; ca_kw=-; ca_id=-; ca_s=self; ca_n=-; ca_i=-; ca_from=-; ganji_jz_wc_jzuid=eyJpdiI6IjRMMCtuelE3d1FtWW5nSzQ5VVJ6QXc9PSIsInZhbHVlIjoiNXNKUVlSR0JEeUV6ZGJkUDJDVVZxQT09IiwibWFjIjoiMzY3N2MwMTY5ODMwOWM2NTBlMjE1YzgxYmJlODgyZjZmZjRiNzEzZThjM2RmZjNjM2VhYzg1NGNhMTJlMWNhYiJ9; ganji_jz_login_source=eyJpdiI6ImN4SnlSQ1R3bGcxRVZNdWJtSUhycnc9PSIsInZhbHVlIjoieEdUdFNSSk1POXk4Yk9BOU43eWVUMnYzRDNcL3VOWVl5OWM1YUJGeDVxNldkSzdCcjVoM2ZadjJPeUMrVGkwQmRzcEN6OUxvUWVaOHgzSXVETEluclwvalltNGVBdTRHaDV5bmk1bDNFTHcxQXJxYkVTRVBONjYzOEFmRWQ3eTYzM3hjb2JOSWlaOVwvTDUybWZxMlcyaXR3PT0iLCJtYWMiOiJlNGY2ZjljMWZjYzk3N2YzZmI3YjY4MGEzY2RjMmZlODhiYTlmOTM5MDJhMGJmOGRmOTFjZTZkNDIwMjA3MDMwIn0%3D; dmb_userid=72974933; doumi_melon=eyJpdiI6IlZWNklWcVpzQ3ZBSit0eEpmUVlENXc9PSIsInZhbHVlIjoiYVwvS1VWNGczYllLQVN6WUc0VzhMVFhsN2NqbE1SY2NBNUkyVDB4ZGdaaVFOZUVzT0tRdTdQWk1iUnRubG8zVHdTczQ4SGYwU25kOWJQZG1aYjc4Zm5nPT0iLCJtYWMiOiI2MDk0ODc5ZTUyMzJiNzllZjBkNjc0M2MzMjM0ZTEzYWJjZDJhZTczMjI3NTQzNDFjYjg5OTBiYTcwMDE0MzE5In0%3D";
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


