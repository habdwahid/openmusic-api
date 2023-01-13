const mapDBToModel = ({
  username, title, action, created_at,
}) => ({
  username, title, action, time: created_at,
});

module.exports = mapDBToModel;
