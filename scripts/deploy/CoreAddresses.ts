import {
  BribeFactory,
  Cone,
  ConeFactory,
  ConeMinter,
  ConeRouter01,
  ConeVoter, Controller,
  GaugeFactory,
  Ve,
  VeDist
} from "../../typechain";

export class CoreAddresses {

  readonly token: Cone;
  readonly gaugesFactory: GaugeFactory;
  readonly bribesFactory: BribeFactory;
  readonly factory: ConeFactory;
  readonly router: ConeRouter01;
  readonly ve: Ve;
  readonly veDist: VeDist;
  readonly voter: ConeVoter;
  readonly minter: ConeMinter;
  readonly controller: Controller;


  constructor(token: Cone, gaugesFactory: GaugeFactory, bribesFactory: BribeFactory, factory: ConeFactory, router: ConeRouter01, ve: Ve, veDist: VeDist, voter: ConeVoter, minter: ConeMinter, controller: Controller) {
    this.token = token;
    this.gaugesFactory = gaugesFactory;
    this.bribesFactory = bribesFactory;
    this.factory = factory;
    this.router = router;
    this.ve = ve;
    this.veDist = veDist;
    this.voter = voter;
    this.minter = minter;
    this.controller = controller;
  }
}
