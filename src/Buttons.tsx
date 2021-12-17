import { FC } from "react";

interface ButtonsProps {
  escrowInitialized: boolean;
  escrowValid: () => boolean;
  submitButtonClicked: boolean;
  acceptButtonClicked: boolean;
  handleIxButtonClick: (buttonName: string) => void;
}

const Buttons: FC<ButtonsProps> = (props: ButtonsProps) => {
  const initializeButtonClassName = !props.escrowInitialized
    ? "valid-ix-button"
    : "invalid-ix-button";
  const submitButtonClassName =
    props.escrowValid() && !props.submitButtonClicked
      ? "valid-ix-button"
      : "invalid-ix-button";
  const acceptButtonClassName =
    props.submitButtonClicked && !props.acceptButtonClicked
      ? "valid-ix-button"
      : "invalid-ix-button";
  const resetButtonClassName = props.escrowInitialized
    ? "valid-reset-button"
    : "invalid-ix-button";

  return (
    <section className="antialiased text-gray-600 pt-8">
      <div className="flex flex-col">
        <div className="w-full mx-auto">
          <div className="grid grid-cols-4 gap-12 text-gray-900">
            <button
              className={initializeButtonClassName}
              onClick={() => props.handleIxButtonClick("initialize")}
            >
              Initialize
            </button>
            <button
              className={submitButtonClassName}
              onClick={() => props.handleIxButtonClick("submit")}
            >
              Submit
            </button>
            <button
              className={acceptButtonClassName}
              onClick={() => {
                if (props.submitButtonClicked) {
                  props.handleIxButtonClick("accept");
                }
              }}
            >
              Accept
            </button>
            <button
              className={resetButtonClassName}
              onClick={() => props.handleIxButtonClick("reset")}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Buttons;
