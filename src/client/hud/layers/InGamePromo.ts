import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { Controller } from "../../Controller";
import { crazyGamesSDK } from "../../CrazyGamesSDK";
import { GameView } from "../../view";

const AD_TYPES = [
  { type: "standard_iab_left1", selectorId: "in-game-bottom-left-ad" },
  { type: "standard_iab_left3", selectorId: "in-game-bottom-left-ad3" },
  { type: "standard_iab_left4", selectorId: "in-game-bottom-left-ad4" },
];

@customElement("in-game-promo")
export class InGamePromo extends LitElement implements Controller {
  public game: GameView;

  private shouldShow: boolean = false;
  private adsVisible: boolean = false;
  private bottomRailDestroyed: boolean = false;
  private cornerAdShown: boolean = false;

  createRenderRoot() {
    return this;
  }

  init() {}

  tick() {
    if (!this.game.inSpawnPhase()) {
      if (!this.bottomRailDestroyed) {
        this.bottomRailDestroyed = true;
        this.destroyBottomRail();
      }
      if (!this.cornerAdShown) {
        this.cornerAdShown = true;
        console.log("[InGamePromo] Spawn phase ended, triggering showAd");
        this.showAd();
      }
    }
  }

  private destroyBottomRail(): void {
    if (!window.ramp) return;

    try {
      window.ramp.destroyUnits("pw-oop-bottom_rail");
      console.log("Bottom rail ad destroyed after spawn phase");
    } catch (e) {
      console.error("Error destroying bottom_rail ad:", e);
    }
  }

  private showAd(): void {
    console.log(
      `[InGamePromo] showAd called, isOnCrazyGames=${crazyGamesSDK.isOnCrazyGames()}`,
    );
    if (window.innerWidth < 1100) return;
    if (window.innerHeight < 750) return;

    if (crazyGamesSDK.isOnCrazyGames()) {
      this.showCrazyGamesAd();
      return;
    }

    if (!window.adsEnabled) return;

    this.shouldShow = true;
    this.requestUpdate();
  }

  private showCrazyGamesAd(): void {
    console.log(
      `[InGamePromo] showCrazyGamesAd called, isReady=${crazyGamesSDK.isReady()}, width=${window.innerWidth}, height=${window.innerHeight}`,
    );
    if (!crazyGamesSDK.isReady()) {
      console.log(
        "[InGamePromo] CrazyGames SDK not ready, skipping in-game ad",
      );
      return;
    }

    this.requestUpdate();

    this.updateComplete.then(() => {
      console.log("[InGamePromo] DOM updated, calling createBottomLeftAd");
      crazyGamesSDK.createBottomLeftAd();
    });
  }

  render() {
    if (!this.shouldShow) {
      return html``;
    }

    return html`
      <div
        id="in-game-promo-container"
        class="fixed left-0 z-[100] pointer-events-auto flex flex-col-reverse ${this
          .adsVisible
          ? "bg-gray-800 rounded-tr-lg p-1"
          : ""}"
        style="bottom: -0.7cm"
      >
        ${AD_TYPES.map(
          ({ selectorId }) =>
            html`<div id="${selectorId}" style="margin:0;padding:0"></div>`,
        )}
      </div>
    `;
  }
}
