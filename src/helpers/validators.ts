// Note: max discord nickname is 32 charecters.
// Max minecraft name is 16 characters.
// We can use up to 4 characters with the brackets(x2), space, and period.
// this leaves 12 characters for the first name.


export const isValidMinecraftName = function(name) {
    const regex = /^[A-Za-z0-9_]{3,16}$/
    if (name == null) return false;
    return name.match(regex) != null;
}

export const isValidFirstName = function(name) {
    const regex = /^.{3,12}$/
    if (name == null) return false;
    return name.match(regex) != null;
}

export const isValidDiscordName = function(name) {
    const regex = /^.+ \(\.?[A-Za-z0-9_]{3,16}\)$/
    if (name == null) return false;
    return name.match(regex) != null;
}
