import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./components/IOSAddToHomeScreenBanner";
import { HostLobbyModal } from "./HostLobbyModal";
import { JoinLobbyModal } from "./JoinLobbyModal";
import { UsernameInput } from "./UsernameInput";
import { translateText } from "./Utils";

const CARD_BG = "bg-surface";

@customElement("game-mode-selector")
export class GameModeSelector extends LitElement {
  @state() private inputValid: boolean = true;

  createRenderRoot() {
    return this;
  }

  // Silent backstop; the buttons are already disabled while input is invalid.
  private validateUsername(): boolean {
    const usernameInput = document.querySelector(
      "username-input",
    ) as UsernameInput | null;
    return usernameInput ? usernameInput.canPlay() : true;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener(
      "username-validity-change",
      this.handleValidityChange,
    );
    // Pick up the current value in case username-input validated before us.
    const usernameInput = document.querySelector(
      "username-input",
    ) as UsernameInput | null;
    if (usernameInput) {
      this.inputValid = usernameInput.canPlay();
    }
  }

  disconnectedCallback() {
    window.removeEventListener(
      "username-validity-change",
      this.handleValidityChange,
    );
    super.disconnectedCallback();
  }

  private handleValidityChange = (e: Event) => {
    this.inputValid = (e as CustomEvent).detail?.isValid ?? true;
  };

  public stop() {}

  render() {
    return html`
      <div class="flex flex-col gap-4 w-full px-4 sm:px-0 mx-auto pb-4 sm:pb-0">
        <!-- Create/join: mobile only -->
        <div class="sm:hidden grid grid-cols-2 gap-4 h-14">
          ${this.renderSmallActionCard(
            translateText("main.create"),
            this.openHostLobby,
            "bg-surface hover:brightness-[1.08] active:brightness-[0.95] hover:scale-105 hover:shadow-[var(--shadow-action-card-hover)]",
          )}
          ${this.renderSmallActionCard(
            translateText("main.join"),
            this.openJoinLobby,
            "bg-surface hover:brightness-[1.08] active:brightness-[0.95] hover:scale-105 hover:shadow-[var(--shadow-action-card-hover)]",
          )}
        </div>
        <!-- iOS Add to Home Screen banner -->
        <ios-add-to-home-screen-banner></ios-add-to-home-screen-banner>

        <!-- Bottom row: create + join (desktop only) -->
        <div class="hidden sm:grid grid-cols-2 gap-4 h-14">
          ${this.renderSmallActionCard(
            translateText("main.create"),
            this.openHostLobby,
            "bg-surface hover:brightness-[1.08] active:brightness-[0.95] hover:scale-105 hover:shadow-[var(--shadow-action-card-hover)]",
          )}
          ${this.renderSmallActionCard(
            translateText("main.join"),
            this.openJoinLobby,
            "bg-surface hover:brightness-[1.08] active:brightness-[0.95] hover:scale-105 hover:shadow-[var(--shadow-action-card-hover)]",
          )}
        </div>
      </div>
    `;
  }

  private openHostLobby = () => {
    if (!this.validateUsername()) return;
    (document.querySelector("host-lobby-modal") as HostLobbyModal)?.open();
  };

  private openJoinLobby = () => {
    if (!this.validateUsername()) return;
    (document.querySelector("join-lobby-modal") as JoinLobbyModal)?.open();
  };

  private renderSmallActionCard(
    title: string,
    onClick: () => void,
    bgClass: string = CARD_BG,
  ) {
    return html`
      <button
        @click=${onClick}
        ?disabled=${!this.inputValid}
        class="flex items-center justify-center w-full h-full rounded-lg ${bgClass} transition-all duration-200 text-sm lg:text-base font-medium text-white uppercase tracking-wider text-center ${!this
          .inputValid
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : ""}"
      >
        ${title}
      </button>
    `;
  }
}
