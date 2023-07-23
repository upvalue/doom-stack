import { LoaderFunction, redirect, type V2_MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { sampleQuery } from "~/database.server";

export const meta: V2_MetaFunction = () => [{ title: "doom!!!" }];

export const loader: LoaderFunction = async () => {
  return redirect("/example");
};

export default function Index() {
  return null;
}
