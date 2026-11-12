import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, dictionaries, isLocale, LOCALE_COOKIE, type Locale } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getDictionary() {
  return dictionaries[await getLocale()];
}
