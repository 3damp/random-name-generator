const COMPRESSION_FORMAT = "deflate-raw"

async function transformBytes(
    bytes: Uint8Array,
    transformStream: CompressionStream | DecompressionStream,
): Promise<Uint8Array> {
    const transformedStream = new Blob([bytes])
        .stream()
        .pipeThrough(transformStream)
    return new Uint8Array(await new Response(transformedStream).arrayBuffer())
}

function convertBytesToBase64Url(bytes: Uint8Array): string {
    let binaryText = ""
    for (const byte of bytes) binaryText += String.fromCharCode(byte)
    return btoa(binaryText)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "")
}

function convertBase64UrlToBytes(base64UrlText: string): Uint8Array {
    const binaryText = atob(base64UrlText.replace(/-/g, "+").replace(/_/g, "/"))
    return Uint8Array.from(binaryText, (character) => character.charCodeAt(0))
}

export async function compressJsonToUrlSafeText(
    value: unknown,
): Promise<string> {
    const jsonBytes = new TextEncoder().encode(JSON.stringify(value))
    const compressedBytes = await transformBytes(
        jsonBytes,
        new CompressionStream(COMPRESSION_FORMAT),
    )
    return convertBytesToBase64Url(compressedBytes)
}

export async function decompressJsonFromUrlSafeText(
    urlSafeText: string,
): Promise<unknown> {
    const jsonBytes = await transformBytes(
        convertBase64UrlToBytes(urlSafeText),
        new DecompressionStream(COMPRESSION_FORMAT),
    )
    return JSON.parse(new TextDecoder().decode(jsonBytes))
}
