/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Personal Auth Token - Your Personal Auth Token for the Beeminder API */
  "beeminderApiToken": string,
  /** Beeminder Username - Your Beeminder Username */
  "beeminderUsername": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `beeminder` command */
  export type Beeminder = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `beeminder` command */
  export type Beeminder = {}
}


