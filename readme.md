# Notes on TF.JS on windows
* Start with the `simple-object-detection` from the TensorflowJS aka `tfjs` examples
* The `@tensorflow/tfjs-node` and `@tensorflow/tfjs-node-gpu` dependencies in package json use the outdated `1.3.x` version, upgrade that to `1.7.4`, which is the latest version for node 10.
* According to [this issue](https://github.com/tensorflow/tfjs/issues/2341) you should run node `v10.16.3`
* Running on node v12 doesn't seem to work: building the canvas dependency on windows breaks mysteriously
## Using the GPU
* Make sure your GPU is supported and make sure to have the latest drivers
* [Install Visual Studio 2017 community edition](https://my.visualstudio.com/Downloads?PId=6542) (it has to be 2017 because otherwise CUDA 10.0 won't install - and it has to be CUDA 10.0 because tfjs seems to have a hardcoded dependency on the exact dll names of CUDA 10.0)
* Configure node-gyp [to use VS2017](https://github.com/nodejs/node-gyp#option-2)
* Install CUDA Toolkit 10.0 (exact version) ([see here](https://www.tensorflow.org/install/gpu#windows_setup) and [here](https://github.com/tensorflow/tfjs/blob/master/tfjs-node/README.md))
    * Note: the PATHs to add are slightly different between CUDA 10.0 and CUDA 10.1
* Install cuDNN v7.6.5.32 (exact version)
* Set the environment variable to allow sharing the GPU memory `TF_FORCE_GPU_ALLOW_GROWTH=true` as documented [here](https://www.tensorflow.org/guide/gpu#limiting_gpu_memory_growth)
    * You might get the following error otherwise
    
    
    
    2020-08-31 00:23:11.623446: E tensorflow/stream_executor/cuda/cuda_dnn.cc:329] Could not create cudnn handle: CUDNN_STATUS_ALLOC_FAILED
    2020-08-31 00:23:11.629529: E tensorflow/stream_executor/cuda/cuda_dnn.cc:329] Could not create cudnn handle: CUDNN_STATUS_ALLOC_FAILED
    (node:6636) UnhandledPromiseRejectionWarning: Error: Invalid TF_Status: 2
    Message: Failed to get convolution algorithm. This is probably because cuDNN failed to initialize, so try looking to see if a warning log message was printed above.




 