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
const cookieString = "b_web_citydomain=bj; dmb_loginfrom=vip; dmb_from=direct_visits; bdid=0; ganji_uuid=9526057177081344314642; dm_uuid=0207ecf2-1a6b-11ef-b043-1418774d6214; Hm_lvt_5ce0ad453d8e97ccbaafe0027ce9e106=1716892807; c_citydomain=bj; goldmine_melon=eyJpdiI6InJtQXNwbGQ5N2Z0OEk0QndlMW1KRnc9PSIsInZhbHVlIjoiNWFBVmNDb1hrS3p6WVkrNHBhTWtnNGNXYVZsdjNaUEpqSklCUE8rRGl0MUY5R0s0SlFoUGZ5NStxQXJsNDdSR29IWFoyTm93RHZqVUpcL1dvTmduZFF3PT0iLCJtYWMiOiI5ZjdmZmE5NzdjY2M5NjFlMDY0NmZhMWZmYjU2YjMxMWFkNGE3MzYxZDE0MjllNjMyODI4ZDNjZmJmNmM0M2I1In0%3D; cid=17352; is_active=1; related_bd_id=0; dmb_uuid=bweb651948154e55fb69cedb3afd65ee7426; is_first=1; ca_source=-; ca_name=-; ca_kw=-; ca_id=-; ca_s=self; ca_n=-; ca_i=-; ca_from=-; ganji_jz_melon_uuid=eyJpdiI6ImZuNG1ZMDZQUFpFcnQ0T0tJc2kwQVE9PSIsInZhbHVlIjoieHlJeWVpaHc2NEYxSEFFdUtNbmdPc0xJSGtrZlltaG9mM2s1aFhkcVJnZzlSWmtRXC8yOHphRVBMdzJzaGlIWHMiLCJtYWMiOiIzYzgyNWIzNzIyZjVlZjZjMjVmODZkZTgzNTgxZGIyN2UyNTRhMGU0YWVkNjNhZjBjN2I1N2FjNTA0N2QyODFjIn0%3D; ganji_jz_wc_jzuid=eyJpdiI6IlhrUjR3RkwxMFpqeWlQeWZmXC9udElRPT0iLCJ2YWx1ZSI6Ik5IenR5OE9NRzRrNGtiZHMrNzVTWEE9PSIsIm1hYyI6IjcwMTBkMjEzMmE2OGI3YmI4ZGNlODQzNGNhYTkwMDc5NzRjMTJkYTVlZmUwZTdkZTdkOWQxYmZhMDQ1OTNmYjQifQ%3D%3D; ganji_jz_login_source=eyJpdiI6Im5VTU5kXC8wWWtkbDkrSmVaS2Z6TTdBPT0iLCJ2YWx1ZSI6Imt6OGJwbU1GZ0ZxdSs4MDg2M05IOEJpa2JmWTFoQU9DOE9XQmRIRitISXpyMldPWU9YNDZSWmhCbUNZN0ZqenBCNVFueHR4XC9pb1poM2JBdmVGYjNIN2NqVG5CWVN3a2NxNEdhTHRheERwMkZ1QWhIa2QyTThveGhLOEhFN2RxZFl1MkNhRnBxUVZsdWNPOGM2aDh2QlE9PSIsIm1hYyI6IjFjZjk1NmNlMTY4MWM4OWRkYjZmYmVhOGM4ZWFmNWQ5YzY3ZTRkMzU5MzNlNGFhZTEzNDc3MjhmMzI0NTI0YzAifQ%3D%3D; dmb_userid=32800579; jzcrm_session=eyJpdiI6InR6T0c2VFwva0Fua2g3T3hadTJhZVhBPT0iLCJ2YWx1ZSI6IjdOeFlRYkxuY1ViRVwvcWY0enFudDNaUUFhUzVreUNJaUQrbWZwZzNVV3l3STJyRkpObGdQeVV4Z2Z1d2FEdElickVaTTVvek83cXNndDI2V2RQaEpMQT09IiwibWFjIjoiNTI5Y2Q4OTU1YjQwMGI4NTUzZGUxNmNlYWExOWZjMmY0M2U1OTA5OWQ2ZTAwYmZkMmU0MDM0YjAxNWE1ODMwYSJ9; dm_userinfo=32800579; doumi_melon=eyJpdiI6IkFEUktNU2RKYm9iK2J2V1NXSGNcL2dRPT0iLCJ2YWx1ZSI6IlJ1OW1kVUNxb0Q2cFNKN1BPaVZTOWlXN1ZpNUpTNjBNc0hJT0VLV1wvRGhUbkxOekhFSVhE";
//如果域名是localhost，设置cookie
if(window.location.hostname == 'localhost'){
	//setCookies(cookieString);
}

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


