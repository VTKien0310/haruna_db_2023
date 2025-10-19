import type { Router } from "vue-router";
import { MasterRouteName } from "@/modules/master/MasterRouter";

export class MasterNavigationService {
  constructor(private readonly router: Router) {}

  navigateTo404(): void {
    this.router.replace({
      name: MasterRouteName.NOT_FOUND,
    });
  }

  navigateTo400(): void {
    this.router.replace({
      name: MasterRouteName.BAD_REQUEST,
    });
  }
}
