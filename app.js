const dotenv = require('dotenv')
const fs = require('fs')
const KeyVault = require('azure-keyvault')
const AuthenticationContext = require('adal-node').AuthenticationContext

// Load the .ENV file -- This will be run from process.env.<variable>

dotenv.config()

// Load the Key Vault Client variables
const clientId = process.env.KEYVAULT_CLIENT_ID
const clientSecret = process.env.KEYVAULT_CLIENT_SECRET
const secretName = process.env.KEYVAULT_SECRET_NAME
const secretVersion = process.env.KEYVAULT_SECRET_VERSION
const vaultUri = process.env.KEYVAULT_VAULT_URI
const outfile = process.env.OUTFILE_LOCATION

// Connect to Keyvault
const authenticator = function (challenge, callback) {
  const context = new AuthenticationContext(challenge.authorization)
  return context.acquireTokenWithClientCredentials(
    challenge.resource,
    clientId,
    clientSecret,
    function (err, tokenResponse) {
      if (err) throw err
      // Calculate the value to be set in the request's Authorization header and resume the call.
      var authorizationValue =
        tokenResponse.tokenType + ' ' + tokenResponse.accessToken

      return callback(null, authorizationValue)
    }
  )
}
const credentials = new KeyVault.KeyVaultCredentials(authenticator)
const client = new KeyVault.KeyVaultClient(credentials)

// Get the secret
client.getSecret(vaultUri, secretName, secretVersion, (err, res) => {
  if (err) {
    throw err
  }

  fs.writeFile(outfile, res.value, err => {
    if (err) {
      throw err
    }
    console.log(`${outfile} created`)
  })
})
