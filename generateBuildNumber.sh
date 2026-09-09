BUILD_NUMBER=$(date +%Y%m%d)
echo $BUILD_NUMBER > build-number.txt
echo "BUILD_NUMBER=$(echo $BUILD_NUMBER)" >> $GITHUB_ENV
