const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();

let checkIfExists = function(dbKind) {
  return entity => {
    let key = datastore.key([dbKind, entity.MSKEYVALUE])

    return datastore.get(key)
  }
}

exports.write = async (req, res) => {
  try {
    let body = req.body

    let checkingPayload = body.CHK.CHECKING

    let checkingRequests = checkingPayload.map(entity => {
      let key = datastore.key(['checking', entity.MSKEYVALUE])

      return datastore.save({
        key,
        data: [{
            name: 'DISPLAYNAME',
            value: entity.DATA.DISPLAYNAME,
          },
          {
            name: 'EMP_CODE',
            value: entity.DATA.EMP_CODE
          },
          {
            name: 'MX_PRIVILEGE',
            value: entity.DATA.MX_PRIVILEGE,
          }
        ]
      })
    })

    let checkingExistingEntities = await Promise.all(checkingPayload.map(checkIfExists('checking')))
    let checkingCreated = checkingPayload.filter((entity, i) => !checkingExistingEntities[i][0])
    
    await Promise.all(checkingRequests)

    res.status(200).send({
      created: checkingCreated.length,
      updated: checkingPayload.length - checkingCreated.length
    })
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};
