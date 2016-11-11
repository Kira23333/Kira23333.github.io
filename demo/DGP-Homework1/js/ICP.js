/**
 * 2016.11.3 edited by ceng-hua
 */

numeric.getCentroid_3D = function(A){
	var n = numeric.dim(A)[1];
	return numeric.div(numeric.dot(A, numeric.rep([n, 1], 1)), n);
}

numeric.translateMatrix_4D = function( offset ){
 		var ret = numeric.identity(4);
 		for (var i = 0; i < 3; i++){
 			ret[i][3] = offset[i][0];
 		}
 		return ret;
 }

var PCA_2D = function( pointSet_T ){
	//this.pointSet = pointSet;//numeric.dot(numeric.inv(numeric.translateMatrix_3D(numeric.getCentroid_3D)), pointSet);
	var std_pointSet = pointSet_T.slice(0, 3);
	var cov = numeric.dot(std_pointSet, numeric.transpose(std_pointSet));
	var eigen = numeric.eig(cov);
	for (var i = 1; i < 3; i++) {
		if (Math.abs(eigen.lambda[i]) > Math.abs(eigen.lambda[0])) {
			var temp = eigen.lambda[0];
			eigen.lambda[0] = eigen.lambda[i];
			eigen.lambda[i] = temp;
			temp = eigen.E.x[0];
			eigen.E.x[0] = eigen.E.x[i];
			eigen.E.x[i] = temp;
		}
	}
	for (var i = 0; i < 2; i++) {
		if (Math.abs(eigen.lambda[i]) < Math.abs(eigen.lambda[2])) {
			var temp = eigen.lambda[2];
			eigen.lambda[2] = eigen.lambda[i];
			eigen.lambda[i] = temp;
			temp = eigen.E.X[2];
			eigen.E.x[2] = eigen.E.x[i];
			eigen.E.x[i] = temp;
		}
	}
	this.roation_3D = numeric.transpose(eigen.E.x);
	this.PCA = numeric.dot(this.roation_3D, std_pointSet);
}

 var Point_3D = function(p){
 	this.x = p[0];
 	this.y = p[1];
 	this.z = p[2];
 }

 var ICP = function(){
 	this.source = undefined;
 	this.source_T = [];
 	this.n = 0;
 	this.target = undefined;
 	this.target_T = [];
 	this.m = 0;
 	this.translateSource = numeric.identity(4);
 	this.rotation = numeric.identity(4);
 	this.translateTarget = numeric.identity(4);
	this.transform = numeric.identity(4);
 	this.log = "";
	this.threshold = 1e-3;
 }


 ICP.prototype = {
 	load: function( vertices ){
 		if (vertices instanceof THREE.BufferAttribute) {
 			var n = vertices.count;
 			ret = [];
 			for (var i = 0; i < n; i++) {
				var point = [];
				for (var j = 0; j < vertices.itemSize; j++) {
						point.push(vertices.array[i * vertices.itemSize + j]);
				}
				if (vertices.itemSize < 4) {
						point.push(1);
				}
 				ret.push(point);
 			}
 			return ret;
 		}
 		else if (vertices instanceof Array){
	 		var n = vertices.length;
	 		var ret = [];
	 		for (var i = 0; i < n; i++) {
	 			ret.push([vertices[i].x, vertices[i].y, vertices[i].z, 1]);
	 		};
	 		return ret;
	 	}
		return undefined;
 	},
 	loadSource: function( vertices ){
 		this.source = this.load(vertices);
 		this.n = this.source.length;
 		this.source_T = numeric.transpose(this.source);
 		this.translateSource = numeric.inv(numeric.translateMatrix_4D(numeric.getCentroid_3D(this.source_T)));
 	},
 	loadTarget: function( vertices ){
 		this.target = this.load(vertices);
 		this.m = this.target.length;
 		this.target_T = numeric.transpose(this.target);
 		this.translateTarget = numeric.translateMatrix_4D(numeric.getCentroid_3D(this.source_T));
 	},
 	ICP: function( iterations ){
 		if (this.n ===0 || this.m===0) {
 			return undefined;
 		};


 		var PCA_src = new PCA_2D(this.source_T);
		var PCA_tgt = new PCA_2D(this.target_T);
		var PCA_tgt_T = numeric.transpose(PCA_tgt.PCA);

		var points_PCA_tgt = [];
		for (var i = 0; i < PCA_tgt_T.length; i++) {
			points_PCA_tgt.push(new Point_3D(PCA_tgt_T[i]));
		};

		var distance = function(a, b){
			return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2);

		}
		var tgt_kdTree_3D = new kdTree(points_PCA_tgt, distance, ['x', 'y', 'z']);

		var rotation_SVD = numeric.identity(3);
 		for (var i = 0; i < iterations; i++) {
 			var src_temp = numeric.dot(rotation_SVD, PCA_src.PCA);
 			var tgt_temp = this.closestPoint(src_temp, tgt_kdTree_3D);
 			var error = this.RMSD(src_temp, tgt_temp);
 			this.log = "iteration " + (i) + ": RMSD = " + (error) + "\n" + this.log;
 			if (error < this.threshold) break;
 			rotation_SVD = this.SVDAlignment(PCA_src.PCA, tgt_temp);
 		};
 		this.rotation = this.expandRotation(
 			numeric.dot(numeric.inv(PCA_tgt.roation_3D), numeric.dot(rotation_SVD, PCA_src.roation_3D))
 			);
		this.transform = numeric.dot(this.translateTarget, numeric.dot(this.rotation, this.translateSource));
		numeric.precision = 3;
		this.log = numeric.prettyPrint(this.transform) + '\n' + this.log;
 	},
 	expandRotation: function(rotation) {
 		var ret = [];
 		for (var i = 0; i < 3; i++) {
 			ret.push(rotation[i].concat(0));
 		};
 		ret.push([0,0,0,1]);
 		return ret;
 	},
 	closestPoint: function(src, tgt_kdTree_3D) {
 		var ret = [];
 		src = numeric.transpose(src);
 		var n = src.length;
 		for (var i = 0; i < src.length; i++) {
 			var p = new Point_3D(src[i]);
 			var nearest = tgt_kdTree_3D.nearest(p, 1);
			p = null;
 			ret.push([nearest[0][0].x, nearest[0][0].y, nearest[0][0].z]);
 		}
 		return numeric.transpose(ret);
 	},
 	SVDAlignment: function(src, tgt) {
 		var usv = numeric.svd(numeric.dot(src, numeric.transpose(tgt)));
 		return numeric.dot(numeric.transpose(usv.V), usv.U);
 	},
 	RMSD: function(src, tgt) {
 		var d = numeric.sub(src, tgt);
 		var n = numeric.dim(d)[1];
 		return numeric.norm2(d) / n;
  	},
 };
