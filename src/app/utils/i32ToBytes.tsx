export function i32ToBytes(num: number) {
    const arr = new ArrayBuffer(4)
    const view = new DataView(arr)
    view.setInt32(0, num, false)
    return new Uint8Array(arr)
}