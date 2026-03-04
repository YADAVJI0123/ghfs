export default {
  // repo: 'owner/name',
  directory: '.ghfs',
  auth: {
    // token: process.env.GH_TOKEN,
  },
  sync: {
    issues: true,
    pulls: true,
    closed: 'existing',
    patches: 'open',
  },
}
