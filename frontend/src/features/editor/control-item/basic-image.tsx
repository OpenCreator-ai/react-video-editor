import { ScrollArea } from "@/components/ui/scroll-area";
import { IBoxShadow, IImage, ITrackItem } from "@designcombo/types";
import Outline from "./common/outline";
import Shadow from "./common/shadow";
import Opacity from "./common/opacity";
import Rounded from "./common/radius";
import AspectRatio from "./common/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Crop } from "lucide-react";
import { useEffect, useState } from "react";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT, ADD_ANIMATION } from "@designcombo/state";
import Blur from "./common/blur";
import Brightness from "./common/brightness";
import useLayoutStore from "../store/use-layout-store";
import { Label } from "@/components/ui/label";
import Animation from "./common/animation";
import { IAnimation } from "./types";
import { Switch } from "@/components/ui/switch";
import { Easing } from "remotion";

// 扩展IImageDetails接口
declare module "@designcombo/types" {
  interface IImageDetails {
    animation?: IAnimation;
    animationEnabled?: boolean;
  }
}

// 创建动画的工具函数
const createUpwardAnimation = (params: IAnimation, itemHeight: number = 100) => {
  const { speed, direction, timing } = params;
  
  // 计算动画距离，speed作为倍数
  const distance = itemHeight * speed * 0.5; // 减少移动距离
  
  // 根据方向设置动画参数
  let fromValue = 0;
  let toValue = 0;
  let property = "translateY";
  
  switch (direction) {
    case "up":
      fromValue = distance;
      toValue = 0;
      property = "translateY";
      break;
    case "down":
      fromValue = -distance;
      toValue = 0;
      property = "translateY";
      break;
    case "left":
      fromValue = distance;
      toValue = 0;
      property = "translateX";
      break;
    case "right":
      fromValue = -distance;
      toValue = 0;
      property = "translateX";
      break;
  }
  
  // 设置缓动函数
  let easingFunction = Easing.ease;
  switch (timing) {
    case "ease":
      easingFunction = Easing.ease;
      break;
    case "ease-in":
      easingFunction = Easing.in(Easing.ease);
      break;
    case "ease-out":
      easingFunction = Easing.out(Easing.ease);
      break;
    case "ease-in-out":
      easingFunction = Easing.inOut(Easing.ease);
      break;
    case "linear":
      easingFunction = Easing.linear;
      break;
  }
  
  return {
    property,
    from: fromValue,
    to: toValue,
    durationInFrames: Math.max(15, Math.min(60, 30 / speed)), // 根据速度调整时长
    ease: easingFunction,
    delay: 0,
  };
};

const BasicImage = ({ trackItem }: { trackItem: ITrackItem & IImage }) => {
  const [properties, setProperties] = useState(trackItem);
  const { setCropTarget } = useLayoutStore();
  useEffect(() => {
    setProperties(trackItem);
  }, [trackItem]);

  // 初始化动画属性，如果不存在
  useEffect(() => {
    if (trackItem.details.animation === undefined) {
      dispatch(EDIT_OBJECT, {
        payload: {
          [trackItem.id]: {
            details: {
              animation: {
                speed: 1,
                direction: "up",
                timing: "ease",
              },
              animationEnabled: false,
            },
          },
        },
      });
    }
  }, [trackItem.id]);

  const onChangeBorderWidth = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            borderWidth: v,
          },
        },
      },
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          borderWidth: v,
        },
      };
    });
  };

  const onChangeBorderColor = (v: string) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            borderColor: v,
          },
        },
      },
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          borderColor: v,
        },
      };
    });
  };

  const handleChangeOpacity = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            opacity: v,
          },
        },
      },
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          opacity: v,
        },
      };
    });
  };

  const onChangeBlur = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            blur: v,
          },
        },
      },
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          blur: v,
        },
      };
    });
  };
  const onChangeBrightness = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            brightness: v,
          },
        },
      },
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          brightness: v,
        },
      };
    });
  };

  const onChangeBorderRadius = (v: number) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            borderRadius: v,
          },
        },
      },
    });
    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          borderRadius: v,
        },
      };
    });
  };

  const onChangeBoxShadow = (boxShadow: IBoxShadow) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            boxShadow: boxShadow,
          },
        },
      },
    });

    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          boxShadow,
        },
      };
    });
  };

  const onChangeAnimation = (animation: IAnimation) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            animation: animation,
          },
        },
      },
    });

    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          animation,
        },
      };
    });

    // 如果动画已启用，立即应用新的动画效果
    if (properties.details.animationEnabled) {
      applyAnimationToTrackItem(animation);
    }
  };

  const toggleAnimation = (enabled: boolean) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            animationEnabled: enabled,
          },
        },
      },
    });

    setProperties((prev) => {
      return {
        ...prev,
        details: {
          ...prev.details,
          animationEnabled: enabled,
        },
      };
    });

    if (enabled) {
      // 启用动画时应用当前动画设置
      const currentAnimation = properties.details.animation || {
        speed: 1,
        direction: "up",
        timing: "ease",
      };
      applyAnimationToTrackItem(currentAnimation);
    } else {
      // 禁用动画时移除动画效果
      dispatch(ADD_ANIMATION, {
        payload: {
          id: trackItem.id,
          animations: {
            in: null,
            out: null,
          },
        },
      });
    }
  };

  const applyAnimationToTrackItem = (animationParams: IAnimation) => {
    const itemHeight = properties.details.height || 100;
    const animationComposition = createUpwardAnimation(animationParams, itemHeight);
    
    console.log("Applying animation:", {
      params: animationParams,
      composition: animationComposition,
      trackItemId: trackItem.id
    });
    
    // 创建入场动画
    const inAnimation = {
      name: `custom-${animationParams.direction}-in`,
      composition: [animationComposition],
    };
    
    // 创建出场动画（与入场动画相反）
    const outAnimation = {
      name: `custom-${animationParams.direction}-out`,
      composition: [{
        ...animationComposition,
        from: animationComposition.to,
        to: animationComposition.from,
      }],
    };
    
    dispatch(ADD_ANIMATION, {
      payload: {
        id: trackItem.id,
        animations: {
          in: inAnimation,
          out: outAnimation,
        },
      },
    });
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
        Image
      </div>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-2 px-4">
          <div className="mb-4 mt-2">
            <Button
              variant={"secondary"}
              size={"icon"}
              onClick={() => {
                setCropTarget(trackItem);
              }}
            >
              <Crop size={18} />
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="font-sans text-xs font-semibold text-primary">
              Basic
            </Label>

            <AspectRatio />
            <Rounded
              onChange={(v: number) => onChangeBorderRadius(v)}
              value={properties.details.borderRadius as number}
            />
            <Opacity
              onChange={(v: number) => handleChangeOpacity(v)}
              value={properties.details.opacity!}
            />

            <Blur
              onChange={(v: number) => onChangeBlur(v)}
              value={properties.details.blur!}
            />
            <Brightness
              onChange={(v: number) => onChangeBrightness(v)}
              value={properties.details.brightness!}
            />
          </div>

          <Outline
            label="Outline"
            onChageBorderWidth={(v: number) => onChangeBorderWidth(v)}
            onChangeBorderColor={(v: string) => onChangeBorderColor(v)}
            valueBorderWidth={properties.details.borderWidth as number}
            valueBorderColor={properties.details.borderColor as string}
          />
          <Shadow
            label="Shadow"
            onChange={(v: IBoxShadow) => onChangeBoxShadow(v)}
            value={properties.details.boxShadow!}
          />
          <div className="flex flex-col gap-2 py-4">
            <div className="flex items-center justify-between">
              <Label className="font-sans text-xs font-semibold text-primary">
                Animate
              </Label>
              <Switch 
                checked={properties.details.animationEnabled || false} 
                onCheckedChange={toggleAnimation}
              />
            </div>
            {properties.details.animationEnabled && (
              <Animation
                label=""
                onChange={(v: IAnimation) => onChangeAnimation(v)}
                value={properties.details.animation || { speed: 1, direction: "up", timing: "ease" }}
              />
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default BasicImage;
