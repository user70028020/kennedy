export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["clear-localhost-cache.html","logoclaro.png","logoescuro.png","theme-test.html"]),
	mimeTypes: {".html":"text/html",".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.B8QXWFDM.js",app:"_app/immutable/entry/app.e5Gv9_zK.js",imports:["_app/immutable/entry/start.B8QXWFDM.js","_app/immutable/chunks/VH3MxTbr.js","_app/immutable/chunks/CyUuy-wj.js","_app/immutable/chunks/u-DmHNmw.js","_app/immutable/chunks/PPVm8Dsz.js","_app/immutable/entry/app.e5Gv9_zK.js","_app/immutable/chunks/PPVm8Dsz.js","_app/immutable/chunks/CyUuy-wj.js","_app/immutable/chunks/Ds7I-RoO.js","_app/immutable/chunks/BVSBLeZ4.js","_app/immutable/chunks/DNhq2NOS.js","_app/immutable/chunks/CgjK9u-w.js","_app/immutable/chunks/B9KgWSyi.js","_app/immutable/chunks/c2Jz6SHd.js","_app/immutable/chunks/k3Q1lqoc.js","_app/immutable/chunks/Ds5fY43x.js","_app/immutable/chunks/u-DmHNmw.js","_app/immutable/chunks/DxC-crzK.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js')),
			__memo(() => import('./nodes/14.js')),
			__memo(() => import('./nodes/15.js')),
			__memo(() => import('./nodes/16.js')),
			__memo(() => import('./nodes/17.js')),
			__memo(() => import('./nodes/18.js')),
			__memo(() => import('./nodes/19.js')),
			__memo(() => import('./nodes/20.js')),
			__memo(() => import('./nodes/21.js')),
			__memo(() => import('./nodes/22.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/admin/auditoria",
				pattern: /^\/admin\/auditoria\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/admin/backups",
				pattern: /^\/admin\/backups\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/admin/colaboradores",
				pattern: /^\/admin\/colaboradores\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/admin/database",
				pattern: /^\/admin\/database\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/admin/lixeira",
				pattern: /^\/admin\/lixeira\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/admin/mesclar",
				pattern: /^\/admin\/mesclar\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/admin/os",
				pattern: /^\/admin\/os\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/admin/relatorios",
				pattern: /^\/admin\/relatorios\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/admin/templates",
				pattern: /^\/admin\/templates\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/admin/usuarios",
				pattern: /^\/admin\/usuarios\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/relatorios",
				pattern: /^\/relatorios\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/relatorios/fotografico",
				pattern: /^\/relatorios\/fotografico\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/relatorios/gastos",
				pattern: /^\/relatorios\/gastos\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/relatorios/rdo",
				pattern: /^\/relatorios\/rdo\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/relatorios/spda",
				pattern: /^\/relatorios\/spda\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/relatorios/tecnico",
				pattern: /^\/relatorios\/tecnico\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 22 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
