/**
 * @name splitPermissionString
 * @param {String} str 
 * @returns { Array<String> }
 */
const splitPermissionString = (str) => {
  try {
    if (typeof str === "string" && str.includes("::")) {
      const [firstPart, secondPart] = str.split("::");
      return [firstPart.trim(), secondPart.trim()];
    } else {
      throw new Error("Invalid permission string or delimiter not found");
    }
  } catch (error) {
    console.error(error.message);
    return [];
  }
};


/**
 * @name controller
 * @description 权限控制器
 * @type { Object }
 * @property { Boolean } hasRequested 是否发去过请求
 * @property { Array<String> } permissionList 权限集合
 * @property { Promise } task 真正的请求任务
 * @property { Function } getPermissionsApi 获取权限的接口
 */
const controller = {
  hasRequested: false,
  permissionList: [],
  task: null,
  getPermissionsApi: null,
};

/**
 * @name checkPermission
 * @param { String | Array } value 权限指令的 value
 * @returns { Boolean } 是否有权限
 */
const checkPermission = async (value = null) => {
  if (!controller.hasRequested) {
    controller.hasRequested = true;
    controller.task = controller.getPermissionsApi();
  }

  if (Array.isArray(value)) {
    const hasPermission = await Promise.all(
      value.map((item) => checkPermission(item))
    );

    return hasPermission.every((item) => item === true);
  }

  controller.permissionList = await controller.task;

  const [module = null, operate = null] = splitPermissionString(value) ?? [];

  const hasModule = module && controller.permissionList[module];

  if (!module || !operate || !hasModule) return false;

  return hasModule?.includes(operate) ?? false;
};

export default {
  /**
   * @name install
   * @param { Function } Vue 
   * @param { Object } options 
   * @param { Function } options.getPermissionsApi 获取权限的接口
   * @param { Function } options.checkPermission 检查权限的方法
   * @param { String } options.name 自定义指令的名称
   * @param { String } options.className 自定义指令隐藏的 ClassName
   * @returns { void }
   */
  install(Vue, options = {}) {
    if (!options.getPermissionsApi && !options.checkPermission) {
      throw new Error("getPermissionsApi or checkPermission is required");
    }

    const checkPermissionMethod = options.checkPermission ?? checkPermission;
    controller.getPermissionsApi = options.getPermissionsApi;

    Vue.directive(options?.name ?? "permission", {
      async inserted(el, binding) {
        options.className
          ? el.classList.add(options.className)
          : (el.style.display = "none");

        const hasPermission = await checkPermissionMethod(binding.value);

        options.className
          ? el.classList.remove(options.className)
          : (el.style.display = "");

        if (!hasPermission) {
          el.parentNode?.removeChild(el);
        }
      },

      async update(el, binding) {
        const hasPermission = await checkPermissionMethod(binding.value);
        if (hasPermission) {
          if (!el.parentNode) {
            el.__v_originalParent?.insertBefore(el, el.__v_anchor || null);
          }
        } else {
          if (el.parentNode) {
            el.__v_anchor = document.createComment("");
            el.__v_originalParent = el.parentNode;
            el.parentNode.replaceChild(el.__v_anchor, el);
          }
        }
      },
    });
  },
};
