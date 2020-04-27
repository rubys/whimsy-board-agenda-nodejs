import devproxy from "../sources/devproxy.js";

// temporary scaffolding: forward post-data requests to the production whimsy server

export default async function(request) {
    console.log('body:', JSON.stringify(request.body))
  let response = await devproxy(request, "json/post-data", "post", JSON.stringify(request.body));
  console.log(response);
  return JSON.parse(response);
}