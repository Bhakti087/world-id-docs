/**
 * Contains a hosted version of the World ID JS integration/widget, ready to be used in staging & production
 */
import React, { useEffect, useMemo, useState } from "react";
import Head from "@docusaurus/Head";
import styles from "./use.module.scss";
import Logo from "@site/static/img/logo.svg";
import IconQuestionCircle from "@site/static/img/icon-question-circle.svg";
import {
  WidgetProps,
  VerificationResponse,
  WorldIDWidget,
} from "@worldcoin/id";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import Tooltip from "react-simple-tooltip";
import BrowserOnly from "@docusaurus/BrowserOnly";

const PAGE_DESCRIPTION =
  "Prove you're a unique human without revealing any personal data";

enum State {
  Initial,
  Ready,
  MissingParams,
  Completed,
}

const validateUrl = (candidate: string): boolean => {
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") {
      console.error("Provided `returnTo` must always be over https.");
      return false;
    }
    return true;
  } catch {
    console.error("Provided `returnTo` url is not valid.");
    return false;
  }
};

export default function HostedWorldID(): JSX.Element {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => <_HostedWorldIDComponent />}
    </BrowserOnly>
  );
}

function _HostedWorldIDComponent(): JSX.Element {
  const [state, setState] = useState(State.Initial);
  const location = useLocation();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location]
  );
  useEffect(() => {
    if (
      queryParams.get("signal") &&
      queryParams.get("action_id") &&
      queryParams.get("return_to") &&
      validateUrl(queryParams.get("return_to"))
    ) {
      setState(State.Ready);
    } else {
      setState(State.MissingParams);
    }
  }, [queryParams]);

  return (
    <>
      <Head>
        <title>Verify with World ID</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta name="og:description" content={PAGE_DESCRIPTION} />
      </Head>
      <div className={styles.hostedWID}>
        <div>
          <Logo className={styles.logo} />
        </div>
        <div className={styles.card}>
          <h1 className={styles.title}>Welcome to World ID</h1>
          <p className={styles.caption}>
            Verify you are a unique human with World ID.
          </p>
          {state === State.Ready && (
            <WorldIDComponent
              actionId={queryParams.get("action_id")}
              signal={queryParams.get("signal")}
              appName={queryParams.get("app_name")}
              signalDescription={queryParams.get("signal_description")}
              returnTo={new URL(queryParams.get("return_to"))}
            />
          )}
          {state === State.MissingParams && (
            <>
              <p className={styles.errorText}>
                It looks like some parameters are missing or invalid from this
                request. Please check your link and try again.
              </p>
              <p className={styles.devCaption}>
                If you're a developer, check{" "}
                <Link to="/docs/js#hosted-version">the docs</Link> for this
                hosted version of the World ID widget.
              </p>
            </>
          )}
        </div>
        <div className={styles.learnMore}>
          Learn more about <Link to="/docs">World ID</Link> and about{" "}
          <Link to="https://worldcoin.org">Worldcoin</Link>.
        </div>
      </div>
    </>
  );
}

interface WorldIDComponentProps
  extends Omit<WidgetProps, "onSuccess" | "onError"> {
  returnTo: URL;
}

function WorldIDComponent({
  returnTo,
  ...worldIDProps
}: WorldIDComponentProps): JSX.Element {
  const worldID = require("@worldcoin/id");
  const [proof, setProof] = useState(null as null | VerificationResponse);

  const handleContinue = (): void => {
    const params = new URLSearchParams(
      proof as unknown as Record<string, string>
    );
    window.location.href = `${returnTo}?${params.toString()}`;
  };

  return (
    <>
      <div className={styles.urlInfo}>
        Verifying for{" "}
        <b className={styles.url} title={returnTo.hostname}>
          {returnTo.hostname}
        </b>
        <Tooltip
          content={
            <div style={{ width: 220 }}>
              Please make sure you trust this domain.
            </div>
          }
          padding={8}
          placement="bottom"
          fontSize="0.85em"
          radius={10}
        >
          <IconQuestionCircle style={{ marginBottom: -6 }} />
        </Tooltip>
      </div>
      <WorldIDWidget
        {...worldIDProps}
        enableTelemetry
        onSuccess={(proof) => setProof(proof)}
      />
      <div className={styles.btnContainer}>
        <button
          className={styles.btnContinue}
          disabled={!proof}
          onClick={handleContinue}
        >
          Continue{proof && <> to {returnTo.hostname}</>}
        </button>
      </div>
    </>
  );
}
