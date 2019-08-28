import * as React from "react";
import { ErrorBoundary } from "../../ErrorBoundary";
import { storiesOf } from "@storybook/react";
import { Format } from "./Format";
import { DateContext } from "../../utils/DateContext";
import { wInfo } from "../../utils";
import { text, boolean, select } from "@storybook/addon-knobs/react";

const dateFnsLocales = ["af","ar-DZ","ar-SA","ar","be","bg","bn","ca","cs","cy","da","de","el","en-CA","en-GB","en-US","eo","es","et","fa-IR","fi","fr-CH","fr","gl","he","hr","hu","id","is","it","ja","ka","ko","lt","lv","mk","ms","nb","nl-BE","nl","nn","pl","pt-BR","pt","ro","ru","sk","sl","sr","sv","th","tr","ug","uk","vi","zh-CN","zh-TW"];
type dateFnsLocalesType = "af" | "ar-DZ" | "ar-SA" | "ar" | "be" | "bg" | "bn" | "ca" | "cs" | "cy" | "da" | "de" | "el" | "en-CA" | "en-GB" | "en-US" | "eo" | "es" | "et" | "fa-IR" | "fi" | "fr-CH" | "fr" | "gl" | "he" | "hr" | "hu" | "id" | "is" | "it" | "ja" | "ka" | "ko" | "lt" | "lv" | "mk" | "ms" | "nb" | "nl-BE" | "nl" | "nn" | "pl" | "pt-BR" | "pt" | "ro" | "ru" | "sk" | "sl" | "sr" | "sv" | "th" | "tr" | "ug" | "uk" | "vi" | "zh-CN" | "zh-TW"


(storiesOf("Components/Format", module) as any).addWithJSX(
  "basic format",
  wInfo(`

  ### Notes

  This is a demostrates the format component

  `)(() => {
    const mid = "format";
    const cid = "context";
    const date = text("date", "2019-01-01", mid);
    const convertToDate = boolean("Pass date as type 'string'", true, mid);
    const convertContextToDate = boolean("Pass context date as type 'string'", true, cid);
    const convertContextToBaseDate = boolean("Pass context base date as type 'string'", true, cid);
    const contextdate = text("Context date", "2019-01-02", cid);
    const contextbasedate = text("Context base date", "2019-02-01", cid);
    const contextlocale = select("context locale", dateFnsLocales, "de", cid) || "de";
    const xdefault = "none (default)";
    const locale = select("locale", [xdefault].concat(dateFnsLocales), xdefault, mid);

    return (
      <ErrorBoundary>
        <DateContext
          date={convertContextToDate ? new Date(contextdate) : contextdate}
          baseDate={convertContextToBaseDate ? new Date(contextbasedate) : contextbasedate}
          locale={(contextlocale) as dateFnsLocalesType}
          defaultFormat={text("Context format", "PP pp", cid) || undefined}
        >
          <Format
            format={text("format", "pppp", mid) || undefined}
            date={convertToDate ? new Date(date) : date}
            options={{
              locale: locale === xdefault ? undefined : locale
            }}
          />
        </DateContext>
      </ErrorBoundary>
    );
  })
);
