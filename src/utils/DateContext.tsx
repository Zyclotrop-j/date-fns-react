import * as React from "react";
import { Locale } from "date-fns";
import PropTypes from "prop-types";

const localesMap = {
  lastUsed: undefined
};
const dumpLocalesMap = new Proxy(localesMap, {
    get: function(obj : object, rlocale : string) {
      if(rlocale in obj) return obj[rlocale];
      return undefined;
    }
});
const defaultContextValue = {
  get date() { return new Date() },
  get baseDate() { return new Date() },
  get locale() { return; },
  defaultFormat: "pppp",
  locales: dumpLocalesMap,
};
const RawDateContext = React.createContext(defaultContextValue);

const dateFnsLocales = ["af","ar-DZ","ar-SA","ar","be","bg","bn","ca","cs","cy","da","de","el","en-CA","en-GB","en-US","eo","es","et","fa-IR","fi","fr-CH","fr","gl","he","hr","hu","id","is","it","ja","ka","ko","lt","lv","mk","ms","nb","nl-BE","nl","nn","pl","pt-BR","pt","ro","ru","sk","sl","sr","sv","th","tr","ug","uk","vi","zh-CN","zh-TW"];
interface DateContextProps {
  render?: ({ loading } : { loading : boolean }) => React.ReactNode;
  children?: React.ReactNode;
  date?: string | Date,
  baseDate?: string | Date,
  defaultFormat?: string,
  locale?: "af" | "ar-DZ" | "ar-SA" | "ar" | "be" | "bg" | "bn" | "ca" | "cs" | "cy" | "da" | "de" | "el" | "en-CA" | "en-GB" | "en-US" | "eo" | "es" | "et" | "fa-IR" | "fi" | "fr-CH" | "fr" | "gl" | "he" | "hr" | "hu" | "id" | "is" | "it" | "ja" | "ka" | "ko" | "lt" | "lv" | "mk" | "ms" | "nb" | "nl-BE" | "nl" | "nn" | "pl" | "pt-BR" | "pt" | "ro" | "ru" | "sk" | "sl" | "sr" | "sv" | "th" | "tr" | "ug" | "uk" | "vi" | "zh-CN" | "zh-TW" | Locale;
};

const getLocaleLazy = (localeCode : string) => {
  return new Promise((res, rej) => {
    const languageFound : string | undefined = dateFnsLocales.find(q => localeCode === q);
    if(!languageFound) {
      throw new Error(`Invalid locale ${localeCode}!`);
    }
    import(
      /* webpackMode: "lazy" */
      `date-fns/locale/${languageFound}/index.js`
    ).then((lang) => {
      localesMap[languageFound] = lang;
      res({
        ...localesMap,
        locale: lang,
        identifier: languageFound,
        [languageFound || ""]: lang
      });
    });
  });
}

const getDefaultLocaleLazy = (xad : (lang: string) => void) => {
  return new Promise((res, rej) => {
    if(typeof window !== 'undefined' && window.navigator) {
      try {
        const languageFound = navigator.languages.find(browserlangs => dateFnsLocales.some(availLang => availLang === browserlangs));
        if(!languageFound) return;
        xad(languageFound || "");
        return getLocaleLazy(languageFound).then(res).catch(rej);
      } catch(e) {
        console.warn(e);
        return rej(e);
      }
    }
  });
}

export const DateContext : React.SFC<DateContextProps> = (allprops) => {
  const {
    children,
    render,
    locale,
    ...props
  } = allprops;
  const usePlainLocale =
    typeof locale === "object" &&
    locale !== null &&
    Object.getPrototypeOf(locale) === Object.prototype &&
    [
    "formatDistance",
    "formatLong",
    "formatRelative",
    "localize",
    "match",
    "options"
  ].every(k => Object.keys(locale).some(l => l === k));
  const [loadingLocales, setLoadingLocales] = React.useReducer((state : string[], action : string) => state.concat([action]), ([] as string[]));
  const [loadedLocales, setLoadedLocales] = React.useReducer((state : string[], action : string) => state.concat([action]), ([] as string[]));
  const addLoadingLocale = (loc: string) => setLoadingLocales(loc);
  const addLoadedLocale = (loc: string) => setLoadedLocales(loc);
  React.useEffect(() => {
    if(!usePlainLocale && typeof locale === "string" && !loadingLocales.some((q : string) => locale === q)) {
      // we have a code - load it
      addLoadingLocale(locale);
      getLocaleLazy(locale).then(() => {
        addLoadedLocale(locale);
      });
    }
  });
  React.useEffect(() => {
    if(!locale && Object.keys(loadedLocales).length === 0) {
      getDefaultLocaleLazy(addLoadingLocale).then(({ identifier } : { identifier : string }) => {
        addLoadedLocale(identifier);
      });
    }
  }, []);
  const currentLocale =
    usePlainLocale ?
    locale :
    localesMap[typeof locale === "string" ? locale : "lastUsed"] ||
    localesMap.lastUsed;

  localesMap.lastUsed = currentLocale; // Store the locale we use, in case we want to use a locale that is not loaded yet and we need a fallback
  const smartLocalesMap = new Proxy(localesMap, {
      get: function(obj : object, rlocale : string) {
        if(rlocale in obj) return obj[rlocale];
        if(loadingLocales.some((q : string) => rlocale === q)) return currentLocale;
        addLoadingLocale(rlocale);
        getLocaleLazy(rlocale).then(() => {
          addLoadedLocale(rlocale);
        });
        return currentLocale;
      }
  });


  return (<RawDateContext.Provider value={Object.assign(
    {},
    defaultContextValue,
    { locale: currentLocale },
    props,
    { locales: smartLocalesMap }
  )}>
    {children || render && render({ loading: loadingLocales.length === loadedLocales.length })}
  </RawDateContext.Provider>);
};

if(process.env.NODE_ENV === 'develop' || process.env.NODE_ENV === 'dev') {
  DateContext.propTypes = {
    children: PropTypes.node,
    render: PropTypes.func,
    date: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.string
    ]),
    defaultFormat: PropTypes.string,
    locale: PropTypes.any
  };
}

export const _Context = RawDateContext;
export default DateContext;
