

export function assignAndGetLoadingReqStatusForHeaders(dontNeedLoading: boolean, headers: any) {
    if (dontNeedLoading) {
        if (!headers) {
            headers = {};
        }
        headers['hideLoad'] = true;
    }
    return headers;
}