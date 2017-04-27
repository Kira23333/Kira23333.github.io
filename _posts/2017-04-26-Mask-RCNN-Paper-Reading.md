---
layout: post
title: Mask R-CNN Paper Reading
date: 2017-04-26
categories: blog
tags: [Paper]
description:
---


# Classification:
* CNN vs. edge detector(后者会被欺骗纯轮廓，CNN可以做到human-performance)

# Detection:
* Problem
  * High efficiency

* High Level Solution
  1. 枚举(划窗)，计算量大
  2. 回归(迭代，缩减)，多物体的时候会有问题

* R-CNN
  * Proposal Region
  * Fast R-CNN:
    * Proposal有overlap:重复计算，提升的空间
    * SPP/ROI pooling
      * pool the feature map, then concat them
    * Region Proposal net
      * Multiple scales/ratios/anchors

# Instance Segmentation
* Mask R-CNN
  * new task with Fast R-CNN: Mask regression
  * ROI Align?
    * coordinates on ROI feature - coordinates on feature map - coord on image
  * 补slide的图

...

有一个概念好像很重要，计算量！！！
