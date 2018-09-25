/* 
helpers.js
 - A collection of odds and ends that come in handy

Max Potter 2018/03/28
*/

// CONSTANTS
var DIFFUSE_ITER_MAX = 20;
var PRESSURE_ITER_MAX = 40;
var VISCOSITY = 0.9;
var DT = 0.016;

// FUNCTIONS
function w(){return 0.5*window.innerWidth;};
function h(){return 0.5*window.innerHeight;};

// initial alpha & beta params are for velocity diffusion using jacobi iteration to solve poissons eqn.
function alpha1(){return Math.pow(1.0/w(), 2) / (VISCOSITY * DT)};
function beta1(){return 1.0 / (4.0 + alpha1())};

// alpha2 - alpha parameter for jacobi iteration to solve for pressure (-dx*dx)
function alpha2(){return -1.0 * Math.pow(1.0/w(), 2)};