// extract basic authorization credentials from a request object
export default function credentials(request) {
    if (!request.headers.authorization)
        return {};

    let [type, credentials] = request.headers.authorization.split(" ");

    if (type.toLowerCase() !== 'basic')
        return {};

    let [username, password] = Buffer.from(credentials, 'base64').toString().split(':');

    return { username, password };
}