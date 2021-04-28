import React, { FunctionComponent, useEffect, useLayoutEffect } from "react";
import { codeMessageObserver } from "../../utils/messages";
import { useMsgFromCode } from "../hooks";
import { useCodeMessageStore } from "../state";

/**
 * A functional component to be used by each React UI within this
 * Figma plugin
 */
const Wrapper:FunctionComponent<{}> = ({ children }) => {
  const setLastMessage = useCodeMessageStore(state => state.setLastMessage);
  const uiErrors = useMsgFromCode('ui-error');

  // Subscribing to our RxJS observer here, and setting the
  // latest message to the global store
  useLayoutEffect(() => {
    codeMessageObserver()
      .subscribe(msg => {
        console.info(`Got CODE message "${msg.command}"`, msg);
        setLastMessage(msg);
      });
  }, []);

  return (
    <div id="wrapper">
      { !!uiErrors && (
        <div style={{color: 'red'}}>
          { uiErrors.data || 'Sorry, something bad happened' }
        </div>
      )}
      { children }
    </div>
  )
};

Wrapper.displayName = `Wrapper`;
export default Wrapper;