// Counts the instances of @angular/cdk that Yarn Plug'n'Play created (run with "yarn count-cdk").
// Under Plug'n'Play, a package with peer dependencies has one virtual instance per set of peers.
const pnp = require( 'pnpapi' );
const instances = pnp.getAllLocators()
  .filter( l => l.name === '@angular/cdk' && l.reference.startsWith( 'virtual:' ) );
console.log( `${instances.length} instance(s) of @angular/cdk:` );
for( const l of instances ) {
  const deps = pnp.getPackageInformation( l ).packageDependencies;
  console.log( `- ${l.reference.slice( 0, 30 )}... rxjs: ${deps.get( 'rxjs' ) ?? 'none'}` );
}
