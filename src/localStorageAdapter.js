'use strict'

const storeCache = {}

const Adapter = ( name, options ) => {
  if( name in storeCache ) return Promise.resolve( storeCache[ name ] )

  const opts = Object.assign( {}, defaults, options )
  const dbName = [ opts.namespace, name ].join( '-' )
  const dbJson = window.localStorage.getItem( dbName )

  let db

  if( typeof dbJson === 'string' ){
    db = JSON.parse( dbJson )
  } else {
    db = {
      dbName,
      idMap: {},
      keyMap: {}
    }
    window.localStorage.setItem( dbName, JSON.stringify( db ) )
  }

  const api = {
    exists: id => exists( db, id ),
    save: obj => save( db, obj ),
    load: id => load( db, id ),
    get: key => get( db, key ),
    remove: id => remove( db, id ),
    all: () => all( db )
  }

  storeCache[ name ] = api

  // some adapters will need async, this doesn't but has to be consistent
  return Promise.resolve( api )
}

const defaults = {
  namespace: 'mojuleStore'
}

const exists = ( db, id ) => Promise.resolve( id in db.idMap )

const save = ( db, obj ) => {
  const id = obj.value._id
  const key = obj.value.nodeType

  db.idMap[ id ] = obj

  if( !Array.isArray( db.keyMap[ key ] ) )
    db.keyMap[ key ] = []

  db.keyMap[ key ].push( id )

  window.localStorage.setItem( db.dbName, JSON.stringify( db ) )

  return Promise.resolve( obj )
}

const load = ( db, id ) => Array.isArray( id ) ?
  Promise.all( id.map( id => load( db, id ) ) ) :
  Promise.resolve( db.idMap[ id ] )

const get = ( db, key ) => {
  const ids = Array.isArray( db.keyMap[ key ] ) ? db.keyMap[ key ]: []

  return load( db, ids )
}

const remove = ( db, id ) =>
  load( db, id )
    .then( obj => {
      const key = obj.value.nodeType

      delete db.idMap[ id ]

      db.keyMap[ key ] = db.keyMap[ key ].filter(
        currentId => currentId !== id
      )

      window.localStorage.setItem( db.dbName, JSON.stringify( db ) )

      return obj
    })

const all = db => load( db, Object.keys( db.idMap ) )

module.exports = Adapter
