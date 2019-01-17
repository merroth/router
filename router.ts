//Router
interface IScopeDestroyTasks {
	id: string,
	cb: (params?: any) => any
}
interface IRoute {
	name: string
	url: string,
	callback: (params?: any) => any
}
interface IRouterInit {
	run?: boolean
}
class Router {
	private static scopeDestroyTasks: IScopeDestroyTasks[] = [];
	static routes: IRoute[] = []
	private static run: boolean = false;
	private static listener = null;

	static init(params: IRouterInit = {}) {
		this.run = (params.run !== void 0 ? params.run : true);

		if (this.listener !== null) {
			window.removeEventListener('popstate', this.listener)
			this.listener = null;
		}

		if (!this.run) {
			return this;
		}

		this.listener = window.addEventListener('popstate', function (evt) {
			this.checkRoute.call(this);
		}.bind(this));

		setTimeout(function () {
			this.checkRoute.call(this)
		}.bind(this), 0);
		return this;
	}
	static addRoute(name: string | number, url: string, cb: (params?: any) => any) {
		let route = this.routes.find((r) => { return r.name === name });
		url = url.replace(/\//ig, '/');
		if (route === void 0) {
			this.routes.push({
				callback: cb,
				name: name.toString().toLowerCase(),
				url: url
			})
		} else {
			route.callback = cb;
			route.url = url;
		}
		return this;
	}
	static addRoutes(routes: IRoute[] = []) {
		routes
			.forEach((route, routeIndex) => {
				this.addRoute(
					route.name,
					route.url,
					route.callback
				);
			})
		return this;
	}
	static removeRoute(name: string | number) {
		name = name.toString().toLowerCase();
		this.routes = this.routes
			.filter((route) => {
				return route.name != name;
			});
		return this;
	}
	static checkRoute() {
		if (this.run !== true) { return this }
		if (this.routes.length < 1) { return this }
		let hash = window.location.hash.substr(1).replace(/\//ig, '/');
		let hashlist = hash.split('/').filter((h) => { return h.length > 0 });

		let route = this.routes[0];
		let params;
		for (let routeIndex = 0; routeIndex < this.routes.length; routeIndex++) {
			let routeToTest = this.routes[routeIndex];
			let urlList = routeToTest.url.split('/').filter((h) => { return h.length > 0 })
			if (urlList.length <= hashlist.length) {
				params = {};
				let approved = true;
				urlList
					.forEach((urlListElement, i) => {
						if (urlListElement[0] === ":") {
							params[urlListElement.substr(1)] = hashlist[i]
						} else {
							if (urlListElement.toLowerCase() != hashlist[i].toLowerCase()) {
								approved = false;
							}
						}
					});
				if (approved === true) {
					route = routeToTest;
				}
			}
		}
		this.scopeDestroyTasks
			.forEach((task) => {
				task.cb();
			});

		this.scopeDestroyTasks = [];

		route.callback.call(this, params);

	}
	private static scopeDestroyTaskID: number = 0
	static onScopeDestroy(cb: () => any, id: string | number = "scopeKillTask_" + this.scopeDestroyTaskID++) {
		this.scopeDestroyTasks.push({
			cb: cb,
			id: id.toString()
		})
		return this;
	}
	static onScopeDestroyRemove(id: string | number) {
		this.scopeDestroyTasks = this.scopeDestroyTasks
			.filter((task) => {
				return task.id !== id.toString()
			})
		return this;
	}
}
