import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../_services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

	constructor(private authService: AuthService, private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		//The ActivatedRouteSnapshot contains the future route that will be activated and the RouterStateSnapshot contains the future RouterState of the application, should the user pass through the guard check.
		let url: string = state.url;

		return this.checkLogin(url);

		// if (localStorage.getItem('currentUser')) {
  //           // logged in so return true
  //           return true;
  //       }

  //       // not logged in so redirect to login page with the return url
  //       this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
  //       return false;
	}

	canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		return this.canActivate(route, state);
	}

	checkLogin(url: string): boolean {
		if (this.authService.isLoggedIn) { return true; }

		// Store the attempted URL for redirecting
		this.authService.returnUrl = url;

		// Navigate to the login page with extras
		this.router.navigate(['/login']);
		return false;
	}


}
