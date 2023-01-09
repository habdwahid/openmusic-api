const MapDBToModel = ({ id, name, user_id }) => ({ id, name, username: user_id });

module.exports = MapDBToModel;
