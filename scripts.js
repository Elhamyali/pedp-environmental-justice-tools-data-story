// scripts.js

// Keep shared state at top
var last_link_per_story = {};

function initLinks() {
  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    var link = links[i], href = link.getAttribute("href");
    if (!href || !href.match(/#story\/\d+/)) continue;

    var id = href.split("/")[1];
    last_link_per_story["story-" + id] = link;
    link.classList.add("fl-scrolly-link", "story-" + id);
    link.parentNode.classList.add("fl-scrolly-step");

    link.addEventListener("click", function(e) {
      e.preventDefault();
      updateStoryFromLink(this);
    });
  }
  for (var key in last_link_per_story) {
    last_link_per_story[key].classList.add("fl-scrolly-last-link-" + key);
  }
}

function initStories() {
  var stories = document.querySelectorAll(".flourish-embed");
  for (var i = 0; i < stories.length; i++) {
    var story = stories[i];

    // Only reshape the scrolly container for the specific story
    if (story.id === "green-jobs-story") {
      var src = story.dataset.src || "";
      if (!src.includes("/")) continue;
      var id = src.split("/")[1];
      var h = story.getAttribute("data-height") || "75vh";
      var last_link = last_link_per_story["story-" + id];

      if (!last_link) continue; // guard: no links found

      var common_parent = commonAncestor(story, last_link);
      story.id = "story-" + id;

      var target_div = document.createElement("div");
      target_div.classList.add("fl-scrolly-section");
      target_div.style.position = "relative";
      target_div.style.paddingBottom = "1px";
      target_div.id = "fl-scrolly-section-" + id;

      common_parent.classList.add("fl-scrolly-parent-" + id);

      var children = document.querySelectorAll(".fl-scrolly-parent-" + id + " > *");
      story.__found_story__ = false;
      for (var j = 0; j < children.length; j++) {
        var child = children[j];
        if (story.__found_story__) {
          target_div.appendChild(child);
          if (child.querySelector(".fl-scrolly-last-link-story-" + id)) break;
        } else {
          var embed = (child.id === "story-" + id) || child.querySelector("#story-" + id);
          if (embed) {
            story.__found_story__ = true;
            child.style.top = "calc(50vh - " + h + "/2)";
            child.classList.add("fl-scrolly-sticky");
            common_parent.insertBefore(target_div, child);
            target_div.appendChild(child);
          }
        }
      }
    }
  }
}

function initIntersection() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) updateStoryFromLink(entry.target);
    });
  }, { rootMargin: "0px 0px -50% 0px" });

  document.querySelectorAll(".fl-scrolly-link").forEach(function(link) {
    observer.observe(link);
  });
}

function updateStoryFromLink(el) {
  var href = el.getAttribute("href") || "";
  var parts = href.split("/");
  var last = parts[parts.length - 1] || "";
  var slide_number = parseFloat(last.replace("slide-", ""));
  if (isNaN(slide_number)) return;
  var slide_id = slide_number - 1;

  // Target the specific story container
  var container = document.querySelector("#green-jobs-story") || document.querySelector("#story-3338466");
  if (!container) return;

  var iframe = container.querySelector("iframe");
  if (iframe) {
    iframe.src = iframe.src.replace(/#slide-.*/, "") + "#slide-" + slide_id;
  }
}

function parents(node) {
  var nodes = [node];
  for (; node; node = node.parentNode) nodes.unshift(node);
  return nodes;
}

function commonAncestor(node1, node2) {
  var p1 = parents(node1), p2 = parents(node2);
  if (p1[0] !== p2[0]) throw new Error("No common ancestor!");
  for (var i = 0; i < p1.length; i++) {
    if (p1[i] !== p2[i]) return p1[i - 1];
  }
  return document.body;
}

// Optional: if you really want CSS-in-JS, use valid CSS comments
function initStyles() {
  var style = document.createElement("style");
  style.innerHTML =
    ".fl-scrolly-sticky{position:-webkit-sticky;position:sticky;}" +
    ".fl-scrolly-section .fl-scrolly-step{" +
      "position:relative;width:50%;margin:0 auto 50vh;padding:1.25em;" +
      "background:#f9f9f9;/* Light background */color:#333;" +
      "box-shadow:3px 3px 5px rgba(0,0,0,0.1);" +
      "font-family:Figtree,sans-serif;border-radius:10px;opacity:.95;" +
      "text-align:center;transform:translate3d(0,0,0);" +
    "}" +
    ".fl-scrolly-section .fl-scrolly-step a{color:inherit;}";
  document.head.appendChild(style);
}

function initAll() {
  initLinks();
  initStories();
  initIntersection();
  // initStyles(); // you can keep this off if you style via CSS
}

// Run after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll);
} else {
  initAll();
}
