import https from "https";

export async function GET() {
  const initialUrl = "https://link.testfile.org/500MB";
  return await fetchRemote(initialUrl);
}

function fetchRemote(url: string): Promise<Response> {
  return new Promise<Response>((resolve, reject) => {
    https.get(url, (externalRes) => {
      // Check for redirects
      if (
        externalRes.statusCode &&
        [301, 302, 307, 308].includes(externalRes.statusCode)
      ) {
        const newLocation = externalRes.headers.location;
        if (!newLocation) {
          return resolve(
            new Response("Redirected with no location header", {
              status: externalRes.statusCode,
            })
          );
        }
        // Follow the redirect
        return resolve(fetchRemote(newLocation));
      }

      // Handle errors
      if (externalRes.statusCode && externalRes.statusCode >= 400) {
        return resolve(new Response(null, { status: externalRes.statusCode }));
      }

      // If all is good, stream the response
      const { statusCode } = externalRes;
      const headers = new Headers();
      headers.set(
        "Content-Type",
        externalRes.headers["content-type"] || "application/octet-stream"
      );
      if (externalRes.headers["content-length"]) {
        headers.set("Content-Length", externalRes.headers["content-length"]);
      }

      const readableStream = new ReadableStream({
        start(controller) {
          externalRes.on("data", (chunk) => controller.enqueue(chunk));
          externalRes.on("end", () => controller.close());
          externalRes.on("error", (err) => reject(err));
        },
      });

      resolve(
        new Response(readableStream, {
          status: statusCode || 200,
          headers,
        })
      );
    }).on("error", (error) => {
      console.error("Error fetching external resource:", error);
      resolve(new Response("Error fetching the resource", { status: 500 }));
    });
  });
}