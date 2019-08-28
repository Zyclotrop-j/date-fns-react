import * as React from 'react';
import { format, parseISO, Locale } from "date-fns";
import { _Context } from "../../utils/DateContext";

export interface Props {
  date?: Date | number | string,
  format?: string,
  options?: {
    locale?: Locale | string
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    firstWeekContainsDate?: number
    useAdditionalWeekYearTokens?: boolean
    useAdditionalDayOfYearTokens?: boolean
  }
}

export const Format = (props: Props) => {
  const optss = props.options || {};
  const {
    locale,
    ...opts
  } = optss;
  const dateContext = React.useContext(_Context);



  const resovledlocale = typeof locale === "string" ?
    dateContext.locales[locale] :
    locale;

  const providedDate =
    (typeof props.date === "string") ?
    parseISO(props.date) :
    props.date;
  const contextDate =
    (typeof dateContext.date === "string") ?
    parseISO(dateContext.date) :
    dateContext.date;
  const contextLocale = dateContext.locale;

    const combined = !providedDate || !props.date ? contextDate : providedDate;
    try {
      return <div>
        {format(
          combined,
          props.format || dateContext.defaultFormat,
          {
            ...opts,
            locale: resovledlocale || contextLocale || undefined
          }
        )}
      </div>;
    } catch(e) {
      console.error(e);
      return <div>{`Error "${e.name} (${e.message})" formatting ${combined} with format ${props.format || "pppp"}`}</div>;
    }
};
