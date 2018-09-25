/* 
helpers.js
 - A collection of odds and ends that come in handy

Max Potter 2018/03/28
*/

// CONSTANTS
var DIFFUSE_ITER_MAX = 20;
var PRESSURE_ITER_MAX = 50;
var VISCOSITY = 0.9;
var DT = 0.016;

// FUNCTIONS
function w(){return window.innerWidth;};
function h(){return window.innerHeight;};

// initial alpha & beta params are for velocity diffusion using jacobi iteration to solve poissons eqn.
function alpha1(){return Math.pow(1.0/w(), 2) / (VISCOSITY * DT)};
function beta1(){return 1.0 / (4.0 + alpha1())}
