"use strict";

import { Actions } from "flummox";
import resetStorages from "myUtils/resetStorages";
import { initConfig, saveConfig } from "myUtils/persistence";
import encryptValue from "myUtils/encryptValue";
import Immutable from "immutable";

export default class ConfigActions extends Actions {

  constructor(flux) {
    super();
    this.flux = flux;
  }

  settingsDecorator(settings) {
    if (!settings.token){
      return settings;
    }
    let copied = Object.assign({}, settings);
    copied.token = encryptValue(copied.token, this.flux.getPhrase());
    return copied;
  }

  async saveSettings(settings) {
    try {
      const config = await saveConfig(this.settingsDecorator(settings));
      this.flux.setConfig(Immutable.fromJS(config));
      return config;
    } catch(e) {
      console.log(e);
      throw e;
    }
  }
  async clearAllData() {
    try {
      await resetStorages()();
      const config = await initConfig();
      this.flux.setConfig(Immutable.fromJS(config));
      return config;
    } catch(e) {
      console.log(e);
      throw e;
    }
  }
  adjustSettings(settings) {
    return settings;
  }
}
