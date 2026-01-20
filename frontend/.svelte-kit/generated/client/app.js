export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22')
];

export const server_loads = [];

export const dictionary = {
		"/": [4],
		"/admin": [5,[2]],
		"/admin/auditoria": [6,[2]],
		"/admin/backups": [7,[2]],
		"/admin/colaboradores": [8,[2]],
		"/admin/database": [9,[2]],
		"/admin/lixeira": [10,[2]],
		"/admin/mesclar": [11,[2]],
		"/admin/os": [12,[2]],
		"/admin/relatorios": [13,[2]],
		"/admin/templates": [14,[2]],
		"/admin/usuarios": [15,[2]],
		"/login": [16],
		"/relatorios": [17,[3]],
		"/relatorios/fotografico": [18,[3]],
		"/relatorios/gastos": [19,[3]],
		"/relatorios/rdo": [20,[3]],
		"/relatorios/spda": [21,[3]],
		"/relatorios/tecnico": [22,[3]]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));
export const encoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.encode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';